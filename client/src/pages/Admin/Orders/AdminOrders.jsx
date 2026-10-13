import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5000/api";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Chờ xác nhận" },
  { value: "Confirmed", label: "Đã xác nhận" },
  { value: "Processing", label: "Đang chuẩn bị" },
  { value: "Shipping", label: "Đang giao" },
  { value: "Delivered", label: "Đã giao hàng" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Returned", label: "Hoàn trả" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "Tất cả thanh toán" },
  { value: "Unpaid", label: "Chưa thanh toán" },
  { value: "Paid", label: "Đã thanh toán" },
  { value: "Refunded", label: "Đã hoàn tiền" },
];

const PAYMENT_STATUS_UPDATE_OPTIONS = [
  { value: "Unpaid", label: "Chưa thanh toán" },
  { value: "Paid", label: "Đã thanh toán" },
  { value: "Refunded", label: "Đã hoàn tiền" },
];

const ITEMS_PER_PAGE = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    paymentStatus: "",
    from: "",
    to: "",
  });

  const [adminNote, setAdminNote] = useState("");
  const [cancelOrReturnReason, setCancelOrReturnReason] = useState("");

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

  const formatMoney = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(v || 0));

  const getStatusLabel = (status) => {
    return (
      STATUS_OPTIONS.find((item) => item.value === status)?.label || status
    );
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case "Paid":
        return "Đã thanh toán";
      case "Refunded":
        return "Đã hoàn tiền";
      case "Unpaid":
      default:
        return "Chưa thanh toán";
    }
  };

  function getStatusColor(status) {
    switch (status) {
      case "Pending":
        return "#fbbf24";
      case "Confirmed":
        return "#3b82f6";
      case "Processing":
        return "#8b5cf6";
      case "Shipping":
        return "#06b6d4";
      case "Delivered":
        return "#10b981";
      case "Cancelled":
        return "#ef4444";
      case "Returned":
        return "#a855f7";
      default:
        return "#64748b";
    }
  }

  const styles = useMemo(
    () => ({
      page: {
        minHeight: "100vh",
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        color: "#f8fafc",
        padding: "24px",
        background: "#0b0f17",
      },
      pageTitle: {
        margin: 0,
        fontSize: "26px",
        fontWeight: 800,
        color: "#fbbf24",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      },
      pageSubtitle: {
        marginTop: 6,
        color: "#94a3b8",
        fontSize: "13.5px",
      },

      topSection: {
        marginTop: "20px",
        background: "#131b2e",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        borderRadius: "18px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
      },

      filterBar: {
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : "1.45fr 1fr 1fr 1fr 1fr auto auto",
        gap: "12px",
        alignItems: "end",
      },

      inputWrap: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      },
      label: {
        fontSize: "13px",
        color: "#fbbf24",
        fontWeight: 700,
      },
      input: {
        height: "40px",
        borderRadius: "10px",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        padding: "0 12px",
        outline: "none",
        fontSize: "13.5px",
        color: "#ffffff",
        background: "#090d16",
        boxSizing: "border-box",
        colorScheme: "dark",
      },
      select: {
        height: "40px",
        borderRadius: "10px",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        padding: "0 12px",
        outline: "none",
        fontSize: "13.5px",
        color: "#ffffff",
        background: "#090d16",
      },

      actionBtn: {
        cursor: "pointer",
        background: "#fbbf24",
        color: "#090d16",
        border: "none",
        padding: "0 18px",
        borderRadius: "10px",
        fontWeight: 800,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        boxShadow: "0 4px 12px rgba(251, 191, 36, 0.25)",
        height: "40px",
        transition: "all 0.2s ease",
      },
      secondaryBtn: {
        cursor: "pointer",
        background: "#090d16",
        color: "#cbd5e1",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        padding: "0 18px",
        borderRadius: "10px",
        fontWeight: 700,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        height: "40px",
        transition: "all 0.2s ease",
      },

      statsGrid: {
        marginTop: "20px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "14px",
      },
      statCard: {
        background: "#090d16",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        borderRadius: "14px",
        padding: "16px",
      },
      statLabel: {
        fontSize: "13px",
        color: "#94a3b8",
        marginBottom: "8px",
        fontWeight: 700,
      },
      statValue: {
        fontSize: "26px",
        fontWeight: 800,
        color: "#fbbf24",
      },

      tableCard: {
        marginTop: "20px",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        overflow: "visible",
      },
      tableWrap: {
        width: "100%",
        overflowX: "auto",
        background: "#131b2e",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        borderRadius: "18px 18px 0 0",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "1180px",
        fontSize: "13.5px",
        background: "#131b2e",
      },
      thead: {
        background: "#090d16",
        color: "#fbbf24",
      },
      th: {
        padding: "14px 12px",
        textAlign: "left",
        fontWeight: 800,
        borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        fontSize: "12.5px",
      },
      tr: {
        borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
      },
      td: {
        padding: "14px 12px",
        verticalAlign: "middle",
        color: "#cbd5e1",
      },
      code: {
        fontWeight: 800,
        color: "#fbbf24",
      },
      address: {
        color: "#94a3b8",
        fontSize: "12px",
        lineHeight: 1.5,
      },
      dateSub: {
        color: "#94a3b8",
        fontSize: "12px",
      },
      price: {
        color: "#f87171",
        fontWeight: 800,
      },
      empty: {
        textAlign: "center",
        padding: 32,
        color: "#94a3b8",
      },
      loading: {
        padding: 24,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        color: "#fbbf24",
        fontSize: "14px",
      },

      badge: (bg, color = "#fff", border = "transparent") => ({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "110px",
        padding: "6px 10px",
        borderRadius: "999px",
        fontWeight: 800,
        fontSize: "12px",
        background: bg,
        color,
        border: `1px solid ${border}`,
        marginTop: "6px",
      }),

      statusSelect: (status, disabled) => ({
        padding: "8px 12px",
        borderRadius: "10px",
        fontWeight: 800,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        color: "#090d16",
        border: "none",
        backgroundColor: getStatusColor(status),
        minWidth: "160px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        outline: "none",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
      }),

      paginationWrap: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: "16px 20px",
        background: "#090d16",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        borderTop: "none",
        borderRadius: "0 0 18px 18px",
        flexWrap: "wrap",
      },
      paginationInfo: {
        fontSize: "13.5px",
        color: "#94a3b8",
      },
      paginationBtns: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexWrap: "wrap",
      },
      pageBtn: (active = false) => ({
        minWidth: "38px",
        height: "38px",
        borderRadius: "10px",
        border: active ? "none" : "1px solid rgba(212, 175, 55, 0.3)",
        background: active ? "#fbbf24" : "#131b2e",
        color: active ? "#090d16" : "#cbd5e1",
        fontWeight: 800,
        cursor: "pointer",
        padding: "0 12px",
      }),

      modalBackdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "16px",
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      },
      modal: {
        background: "#131b2e",
        borderRadius: "18px",
        width: isMobile ? "100%" : "860px",
        maxWidth: "100%",
        maxHeight: "88vh",
        overflow: "auto",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        boxShadow: "0 18px 40px rgba(0, 0, 0, 0.5)",
        color: "#ffffff",
      },
      modalHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
        background: "#090d16",
      },
      modalTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: 800,
        color: "#fbbf24",
      },
      modalBody: {
        padding: "22px 24px",
      },
      sectionTitle: {
        margin: "20px 0 12px",
        fontSize: "16px",
        fontWeight: 800,
        color: "#fbbf24",
      },
      infoText: {
        margin: "0 0 10px",
        fontSize: "13.5px",
        lineHeight: 1.6,
        color: "#cbd5e1",
      },
      detailTable: {
        width: "100%",
        marginTop: "16px",
        borderCollapse: "collapse",
        border: "1px solid rgba(212, 175, 55, 0.2)",
        borderRadius: "12px",
        overflow: "hidden",
      },
      detailHeadRow: {
        background: "#090d16",
      },
      detailHeadCell: {
        padding: 12,
        textAlign: "left",
        color: "#fbbf24",
        fontWeight: 800,
        borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
        fontSize: "12.5px",
      },
      detailCell: {
        padding: 12,
        borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
        verticalAlign: "middle",
        color: "#cbd5e1",
        fontSize: "13px",
      },
      productRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
      },
      thumb: {
        width: "44px",
        height: "44px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        background: "#090d16",
        flexShrink: 0,
      },
      productMeta: {
        color: "#94a3b8",
        fontSize: "12px",
        lineHeight: 1.5,
      },
      moneyBlock: {
        marginTop: "20px",
        paddingTop: "16px",
        borderTop: "1px solid rgba(212, 175, 55, 0.2)",
        textAlign: "right",
        lineHeight: 1.9,
        color: "#cbd5e1",
      },
      finalMoney: {
        fontSize: "20px",
        marginTop: 6,
        color: "#ffffff",
      },
      finalMoneyValue: {
        color: "#fbbf24",
        fontWeight: 800,
      },
      textarea: {
        width: "100%",
        minHeight: "90px",
        borderRadius: "12px",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        padding: "12px",
        outline: "none",
        fontSize: "13.5px",
        resize: "vertical",
        boxSizing: "border-box",
        background: "#090d16",
        color: "#ffffff",
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      },
      noteList: {
        marginTop: "10px",
        border: "1px solid rgba(212, 175, 55, 0.2)",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#090d16",
      },
      noteItem: {
        padding: "12px 14px",
        borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
        background: "#090d16",
        color: "#cbd5e1",
        fontSize: "13px",
      },
      noteMeta: {
        fontSize: "12px",
        color: "#94a3b8",
        marginTop: 4,
      },
      rowFlex: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexWrap: "wrap",
      },
      modalActions: {
        marginTop: "20px",
        textAlign: "right",
      },
      closeBtn: {
        background: "#090d16",
        color: "#cbd5e1",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        padding: "10px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 800,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      },
    }),
    [isMobile],
  );

  function getPaymentStatusStyle(status) {
    switch (status) {
      case "Paid":
        return styles.badge("rgba(34, 197, 94, 0.15)", "#4ade80", "rgba(34, 197, 94, 0.3)");
      case "Refunded":
        return styles.badge("rgba(168, 85, 247, 0.15)", "#c084fc", "rgba(168, 85, 247, 0.3)");
      case "Unpaid":
      default:
        return styles.badge("rgba(245, 158, 11, 0.15)", "#fbbf24", "rgba(245, 158, 11, 0.3)");
    }
  }

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
    if (filters.status) params.set("status", filters.status);
    if (filters.paymentStatus) {
      params.set("paymentStatus", filters.paymentStatus);
    }
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  const fetchOrders = async (customQueryString = null) => {
    setLoading(true);

    try {
      const queryString =
        typeof customQueryString === "string"
          ? customQueryString
          : buildQueryString();

      const res = await fetch(`${API_BASE}/orders${queryString}`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `GET /api/orders -> ${res.status}. Body: ${text.slice(0, 200)}`,
        );
      }

      const data = await res.json();
      const list = data?.docs || (Array.isArray(data) ? data : []);
      setOrders(list);

      setSelectedOrder((prev) => {
        if (!prev?._id) return prev;
        return list.find((item) => item._id === prev._id) || prev;
      });
    } catch (err) {
      console.error(err);
      toast.error("Không lấy được đơn hàng. Kiểm tra API /api/orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const resetFilters = async () => {
    const emptyFilters = {
      keyword: "",
      status: "",
      paymentStatus: "",
      from: "",
      to: "",
    };

    setFilters(emptyFilters);
    setCurrentPage(1);
    await fetchOrders("");
  };

  const updateOrderInState = (orderId, updatedOrder, fallbackStatus = "") => {
    if (updatedOrder?._id) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o,
        ),
      );

      setSelectedOrder((prev) =>
        prev?._id === updatedOrder._id ? { ...prev, ...updatedOrder } : prev,
      );

      return;
    }

    if (fallbackStatus) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: fallbackStatus } : o,
        ),
      );

      setSelectedOrder((prev) =>
        prev?._id === orderId ? { ...prev, status: fallbackStatus } : prev,
      );
    }
  };

  const handleStatusChange = async (orderId, newStatus, oldStatus) => {
    try {
      setUpdatingOrderId(orderId);

      let res;

      if (newStatus === "Cancelled" || newStatus === "Returned") {
        const reason = window.prompt(
          newStatus === "Cancelled"
            ? "Nhập lý do hủy đơn:"
            : "Nhập lý do hoàn đơn:",
          cancelOrReturnReason || "",
        );

        if (reason === null) {
          setUpdatingOrderId("");
          return;
        }

        setCancelOrReturnReason(reason);

        res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            reason: reason.trim(),
            note: `Admin cập nhật trạng thái: ${getStatusLabel(newStatus)}`,
          }),
        });
      } else if (newStatus === "Delivered") {
        res = await fetch(`${API_BASE}/orders/${orderId}/delivered`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
      } else {
        res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            note: `Admin cập nhật trạng thái: ${getStatusLabel(newStatus)}`,
          }),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `${
            newStatus === "Delivered" ? "PATCH /delivered" : "PATCH /status"
          } -> ${res.status}. Body: ${text.slice(0, 200)}`,
        );
      }

      const data = await res.json().catch(() => null);
      const updatedOrder = data?.order || data || null;

      updateOrderInState(orderId, updatedOrder, newStatus);
      toast.success(`Đã cập nhật: ${getStatusLabel(newStatus)}`);
    } catch (err) {
      console.error(err);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: oldStatus } : o)),
      );

      setSelectedOrder((prev) =>
        prev?._id === orderId ? { ...prev, status: oldStatus } : prev,
      );

      toast.error(
        err?.message?.includes("không đủ tồn kho")
          ? "Không thể giao hàng vì không đủ tồn kho"
          : err?.message?.includes("chưa thanh toán")
            ? "Đơn online chưa thanh toán nên chưa thể giao"
            : "Lỗi cập nhật trạng thái đơn hàng",
      );
    } finally {
      setUpdatingOrderId("");
    }
  };

  const handleSaveAdminNote = async () => {
    if (!selectedOrder?._id) return;

    if (!adminNote.trim()) {
      toast.warning("Vui lòng nhập ghi chú nội bộ");
      return;
    }

    try {
      setSavingNote(true);

      const res = await fetch(
        `${API_BASE}/orders/${selectedOrder._id}/admin-note`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: adminNote.trim(),
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.slice(0, 200));
      }

      const data = await res.json();
      const updatedOrder = data?.order || null;

      if (updatedOrder?._id) {
        updateOrderInState(updatedOrder._id, updatedOrder);
      }

      setAdminNote("");
      toast.success("Đã thêm ghi chú nội bộ");
    } catch (error) {
      console.error(error);
      toast.error("Không thêm được ghi chú nội bộ");
    } finally {
      setSavingNote(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (!selectedOrder?._id) return;

    try {
      setUpdatingPayment(true);

      const res = await fetch(
        `${API_BASE}/orders/${selectedOrder._id}/payment`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: newPaymentStatus,
            note: `Admin cập nhật thanh toán: ${getPaymentStatusLabel(
              newPaymentStatus,
            )}`,
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.slice(0, 200));
      }

      const data = await res.json();
      const updatedOrder = data?.order || null;

      if (updatedOrder?._id) {
        updateOrderInState(updatedOrder._id, updatedOrder);
      }

      toast.success("Đã cập nhật trạng thái thanh toán");
    } catch (error) {
      console.error(error);
      toast.error("Không cập nhật được trạng thái thanh toán");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const orderStats = useMemo(() => {
    const now = new Date();

    const isSameDay = (dateA, dateB) =>
      dateA.getDate() === dateB.getDate() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getFullYear() === dateB.getFullYear();

    const total = orders.length;

    const todayCount = orders.filter((order) => {
      if (!order.createdAt) return false;
      return isSameDay(new Date(order.createdAt), now);
    }).length;

    const monthCount = orders.filter((order) => {
      if (!order.createdAt) return false;
      const d = new Date(order.createdAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const yearCount = orders.filter((order) => {
      if (!order.createdAt) return false;
      return new Date(order.createdAt).getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      todayCount,
      monthCount,
      yearCount,
    };
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([
      1,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  if (loading) {
    return <div style={styles.loading}>Đang tải đơn hàng...</div>;
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Quản Lý Đơn Hàng</h2>
      <div style={styles.pageSubtitle}>
        Theo dõi đơn hàng, cập nhật trạng thái và xem chi tiết từng đơn.
      </div>

      <div style={styles.topSection}>
        <div style={styles.filterBar}>
          <div style={styles.inputWrap}>
            <label style={styles.label}>Tìm kiếm</label>
            <input
              style={styles.input}
              placeholder="Mã đơn / tên người nhận / số điện thoại"
              value={filters.keyword}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keyword: e.target.value }))
              }
            />
          </div>

          <div style={styles.inputWrap}>
            <label style={styles.label}>Trạng thái đơn</label>
            <select
              style={styles.select}
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputWrap}>
            <label style={styles.label}>Thanh toán</label>
            <select
              style={styles.select}
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
            >
              {PAYMENT_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputWrap}>
            <label style={styles.label}>Từ ngày</label>
            <input
              type="date"
              style={styles.input}
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>

          <div style={styles.inputWrap}>
            <label style={styles.label}>Đến ngày</label>
            <input
              type="date"
              style={styles.input}
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>

          <button style={styles.actionBtn} onClick={applyFilters}>
            Lọc
          </button>

          <button style={styles.secondaryBtn} onClick={resetFilters}>
            Đặt lại
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Tổng số đơn hàng</div>
            <div style={styles.statValue}>{orderStats.total}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Đơn trong ngày</div>
            <div style={styles.statValue}>{orderStats.todayCount}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Đơn trong tháng</div>
            <div style={styles.statValue}>{orderStats.monthCount}</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Đơn trong năm</div>
            <div style={styles.statValue}>{orderStats.yearCount}</div>
          </div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Mã đơn</th>
                <th style={styles.th}>Người nhận</th>
                <th style={styles.th}>Ngày đặt</th>
                <th style={styles.th}>Tổng tiền</th>
                <th style={styles.th}>Thanh toán</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => {
                const code =
                  order.orderCode ||
                  (order._id
                    ? `#${order._id.slice(-6).toUpperCase()}`
                    : "#------");

                const fullName =
                  order.shippingAddress?.fullName ||
                  order.userId?.fullName ||
                  "Khách vãng lai";

                const fullAddress =
                  order.shippingAddress?.fullAddress || "Chưa có địa chỉ";

                const createdAt = order.createdAt
                  ? new Date(order.createdAt)
                  : null;

                const totalToPay = order.finalAmount ?? order.totalPrice ?? 0;
                const currentStatus = order.status || "Pending";

                return (
                  <tr key={order._id} style={styles.tr}>
                    <td style={styles.td}>
                      <b style={styles.code}>{code}</b>
                    </td>

                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, color: "#ffffff" }}>{fullName}</div>
                      <div style={styles.address}>{fullAddress}</div>
                    </td>

                    <td style={styles.td}>
                      <div>
                        {createdAt
                          ? createdAt.toLocaleDateString("vi-VN")
                          : "---"}
                      </div>
                      <div style={styles.dateSub}>
                        {createdAt ? createdAt.toLocaleTimeString("vi-VN") : ""}
                      </div>
                    </td>

                    <td style={{ ...styles.td, ...styles.price }}>
                      {formatMoney(totalToPay)}
                    </td>

                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{order.paymentMethod || "COD"}</div>
                      <div
                        style={getPaymentStatusStyle(
                          order.paymentStatus || "Unpaid",
                        )}
                      >
                        {getPaymentStatusLabel(order.paymentStatus || "Unpaid")}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value,
                            currentStatus,
                          )
                        }
                        disabled={updatingOrderId === order._id}
                        style={styles.statusSelect(
                          currentStatus,
                          updatingOrderId === order._id,
                        )}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value} style={{ background: "#131b2e", color: "#ffffff" }}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={styles.actionBtn}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={styles.empty}>
                    Không có đơn hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div style={styles.paginationWrap}>
            <div style={styles.paginationInfo}>
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, orders.length)} /{" "}
              {orders.length} đơn
            </div>

            <div style={styles.paginationBtns}>
              <button
                style={styles.pageBtn(false)}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Trước
              </button>

              {visiblePages.map((page, index) => {
                const prevPage = visiblePages[index - 1];
                const showDots = index > 0 && page - prevPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showDots && (
                      <span style={{ color: "#94a3b8", padding: "0 4px" }}>
                        ...
                      </span>
                    )}
                    <button
                      style={styles.pageBtn(page === currentPage)}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

              <button
                style={styles.pageBtn(false)}
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          style={styles.modalBackdrop}
          onClick={() => setSelectedOrder(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                Chi tiết đơn:{" "}
                {selectedOrder.orderCode ||
                  `#${selectedOrder._id.slice(-6).toUpperCase()}`}
              </h3>
            </div>

            <div style={styles.modalBody}>
              <p style={styles.infoText}>
                <b style={{ color: "#fbbf24" }}>Người nhận:</b>{" "}
                {selectedOrder.shippingAddress?.fullName || "---"}
              </p>
              <p style={styles.infoText}>
                <b style={{ color: "#fbbf24" }}>SĐT:</b>{" "}
                {selectedOrder.shippingAddress?.phoneNumber || "---"}
              </p>
              <p style={styles.infoText}>
                <b style={{ color: "#fbbf24" }}>Địa chỉ:</b>{" "}
                {selectedOrder.shippingAddress?.fullAddress || "---"}
              </p>
              <p style={styles.infoText}>
                <b style={{ color: "#fbbf24" }}>Ghi chú khách:</b> {selectedOrder.customerNote || "---"}
              </p>

              <div style={styles.rowFlex}>
                <p style={{ ...styles.infoText, margin: 0 }}>
                  <b style={{ color: "#fbbf24" }}>Thanh toán:</b> {selectedOrder.paymentMethod || "COD"} —{" "}
                  {getPaymentStatusLabel(
                    selectedOrder.paymentStatus || "Unpaid",
                  )}
                </p>

                <select
                  style={styles.select}
                  value={selectedOrder.paymentStatus || "Unpaid"}
                  disabled={updatingPayment}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                >
                  {PAYMENT_STATUS_UPDATE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value} style={{ background: "#131b2e", color: "#ffffff" }}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <p style={{ ...styles.infoText, marginTop: 10 }}>
                <b style={{ color: "#fbbf24" }}>Trạng thái:</b>{" "}
                {getStatusLabel(selectedOrder.status || "Pending")}
              </p>

              {selectedOrder.cancelReason ? (
                <p style={styles.infoText}>
                  <b style={{ color: "#f87171" }}>Lý do hủy:</b> {selectedOrder.cancelReason}
                </p>
              ) : null}

              {selectedOrder.returnReason ? (
                <p style={styles.infoText}>
                  <b style={{ color: "#f87171" }}>Lý do hoàn:</b> {selectedOrder.returnReason}
                </p>
              ) : null}

              <table style={styles.detailTable}>
                <thead>
                  <tr style={styles.detailHeadRow}>
                    <th style={styles.detailHeadCell}>Sản phẩm</th>
                    <th
                      style={{ ...styles.detailHeadCell, textAlign: "center" }}
                    >
                      SL
                    </th>
                    <th
                      style={{ ...styles.detailHeadCell, textAlign: "right" }}
                    >
                      Giá
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.details?.map((item, index) => (
                    <tr key={index}>
                      <td style={styles.detailCell}>
                        <div style={styles.productRow}>
                          <img
                            src={item.thumbnail || "/no-image.png"}
                            style={styles.thumb}
                            alt={item.productName || "product"}
                            onError={(e) => {
                              e.currentTarget.src = "/no-image.png";
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: "#ffffff" }}>{item.productName}</div>
                            <div style={styles.productMeta}>
                              Size: {item.size || "---"} | Màu:{" "}
                              {item.color || "---"}{" "}
                              {item.sku ? `| SKU: ${item.sku}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...styles.detailCell, textAlign: "center" }}>
                        x{item.quantity}
                      </td>
                      <td style={{ ...styles.detailCell, textAlign: "right", color: "#fbbf24", fontWeight: 700 }}>
                        {formatMoney(item.unitPrice)}
                      </td>
                    </tr>
                  ))}

                  {(!selectedOrder.details ||
                    selectedOrder.details.length === 0) && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ ...styles.detailCell, textAlign: "center" }}
                      >
                        Không có sản phẩm trong đơn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={styles.moneyBlock}>
                <div>
                  Tiền hàng: <b>{formatMoney(selectedOrder.totalPrice)}</b>
                </div>
                <div>
                  Phí ship: <b>{formatMoney(selectedOrder.shippingFee)}</b>
                </div>
                <div>
                  Giảm giá: <b>-{formatMoney(selectedOrder.discountAmount)}</b>
                </div>
                <div>
                  Thuế: <b>{formatMoney(selectedOrder.tax)}</b>
                </div>
                <div style={styles.finalMoney}>
                  Khách trả:{" "}
                  <b style={styles.finalMoneyValue}>
                    {formatMoney(selectedOrder.finalAmount)}
                  </b>
                </div>
              </div>

              <h4 style={styles.sectionTitle}>Ghi chú nội bộ</h4>
              <textarea
                style={styles.textarea}
                placeholder="Nhập ghi chú nội bộ cho đơn hàng..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
              <div style={{ ...styles.modalActions, marginTop: 10 }}>
                <button
                  onClick={handleSaveAdminNote}
                  style={styles.actionBtn}
                  disabled={savingNote}
                >
                  {savingNote ? "Đang lưu..." : "Lưu ghi chú"}
                </button>
              </div>

              <div style={styles.noteList}>
                {selectedOrder.adminNotes?.length > 0 ? (
                  selectedOrder.adminNotes.map((item, index) => (
                    <div
                      key={`${item.createdAt || ""}-${index}`}
                      style={{
                        ...styles.noteItem,
                        borderBottom:
                          index === selectedOrder.adminNotes.length - 1
                            ? "none"
                            : styles.noteItem.borderBottom,
                      }}
                    >
                      <div>{item.content}</div>
                      <div style={styles.noteMeta}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString("vi-VN")
                          : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ ...styles.noteItem, borderBottom: "none" }}>
                    Chưa có ghi chú nội bộ.
                  </div>
                )}
              </div>

              <h4 style={styles.sectionTitle}>Lịch sử xử lý</h4>
              <div style={styles.noteList}>
                {selectedOrder.history?.length > 0 ? (
                  [...selectedOrder.history]
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
                    )
                    .map((item, index, arr) => (
                      <div
                        key={`${item.timestamp || ""}-${index}`}
                        style={{
                          ...styles.noteItem,
                          borderBottom:
                            index === arr.length - 1
                              ? "none"
                              : styles.noteItem.borderBottom,
                        }}
                      >
                        <div>
                          <b style={{ color: "#fbbf24" }}>{getStatusLabel(item.status)}</b>
                          {item.note ? ` - ${item.note}` : ""}
                        </div>
                        <div style={styles.noteMeta}>
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString("vi-VN")
                            : ""}
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={{ ...styles.noteItem, borderBottom: "none" }}>
                    Chưa có lịch sử xử lý.
                  </div>
                )}
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={styles.closeBtn}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;