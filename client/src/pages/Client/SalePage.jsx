/* eslint-disable react-hooks/immutability */
// pages/SalePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

import ProCardGrid from "../../components/common/ProCard/ProCardGrid.jsx";

const API_BASE = "http://localhost:5000";

function extractProducts(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.docs)) return data.docs;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (data.data && Array.isArray(data.data.products)) return data.data.products;
  if (data.products && Array.isArray(data.products.data))
    return data.products.data;
  if (data.result && Array.isArray(data.result.products))
    return data.result.products;
  return [];
}

function toAbsoluteImageUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "https://via.placeholder.com/400x400?text=No+Image";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${API_BASE}${value}`;
  return `${API_BASE}/${value}`;
}

function getMainImage(product) {
  if (typeof product?.thumbnail === "string" && product.thumbnail.trim()) {
    return toAbsoluteImageUrl(product.thumbnail);
  }
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string" && first.trim()) {
      return toAbsoluteImageUrl(first);
    }
    if (
      first &&
      typeof first === "object" &&
      typeof first.imageUrl === "string" &&
      first.imageUrl.trim()
    ) {
      return toAbsoluteImageUrl(first.imageUrl);
    }
  }
  return "https://via.placeholder.com/400x400?text=No+Image";
}

const SalePage = () => {
  const { addToCart } = useCart();

  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [suggestionSeed] = useState(() => Date.now() + Math.random());

  const pickRandomProducts = (items, count = 8) => {
    const list = Array.isArray(items) ? [...items] : [];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, count);
  };

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  async function fetchCoupons() {
    try {
      const res = await axios.get(`${API_BASE}/api/coupons`);
      const activeCoupons = res.data.filter(
        (c) => c.endDate && new Date(c.endDate) >= new Date(),
      );
      setCoupons(activeCoupons);
    } catch (error) {
      console.error("Lỗi tải coupon:", error);
    } finally {
      setLoadingCoupons(false);
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const list = extractProducts(res.data);
      const activeProducts = list.filter(
        (product) =>
          String(product?.status || "ACTIVE").toUpperCase() === "ACTIVE",
      );
      setProducts(activeProducts.length > 0 ? activeProducts : list);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCopyCode = (coupon) => {
    navigator.clipboard.writeText(coupon.code);
    const saved = JSON.parse(localStorage.getItem("savedCoupons")) || [];
    const exists = saved.find((c) => c.code === coupon.code);

    if (!exists) {
      saved.push(coupon);
      localStorage.setItem("savedCoupons", JSON.stringify(saved));
    }
    toast.success(`🎉 Đã lưu mã: ${coupon.code}`);
  };

  const formatDate = (dateString, isFlash) => {
    if (!dateString) return "Không có thời hạn";
    const date = new Date(dateString);
    if (isFlash) {
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    }
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredCoupons = coupons.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "flash_sale") return c.isFlashSale;
    return c.type === activeTab;
  });

  const tabs = [
    { id: "all", label: "🌟 Tất cả" },
    { id: "flash_sale", label: "⚡ Flash Sale" },
    { id: "percent", label: "📊 Giảm %" },
    { id: "fixed", label: "💰 Giảm tiền" },
  ];

  const normalizedProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      images: [getMainImage(p)],
      price: Number(p?.price || 0),
      isNew: Boolean(p?.isNew),
      isSale: Boolean(p?.isSale),
      isFeatured: true,
    }));
  }, [products]);

  const suggestedProducts = useMemo(() => {
    return pickRandomProducts(normalizedProducts, 8);
  }, [normalizedProducts, suggestionSeed]);

  return (
    <div className="sale-page-container fade-in pb-5">
      <style>{`
        /* --- NỀN TOÀN TRANG LUXURY DARK --- */
        .sale-page-container {
          background: #0b0f17 !important;
          color: #f8fafc !important;
          min-height: 100vh;
        }

        /* --- HERO BANNER GOLD --- */
        .sale-hero {
          background: linear-gradient(135deg, #131b2e 0%, #0b0f17 100%) !important;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3) !important;
          padding: 70px 0 50px;
          text-align: center;
          border-radius: 0 0 40px 40px;
          color: #fbbf24 !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          margin-bottom: -35px;
          position: relative;
          z-index: 1;
        }

        .sale-hero h1 {
          color: #fbbf24 !important;
          text-shadow: none !important;
          letter-spacing: 1px;
        }

        .sale-hero p {
          color: #94a3b8 !important;
        }

        /* --- TABS BỘ LỌC --- */
        .filter-section {
          position: relative;
          z-index: 2;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto 32px;
          background: #131b2e !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          padding: 8px 12px;
          border-radius: 999px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 8px 22px;
          border-radius: 30px;
          border: 1px solid transparent;
          background: transparent;
          color: #cbd5e1 !important;
          white-space: nowrap;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .tab-btn:hover {
          color: #fbbf24 !important;
        }

        .tab-btn.active {
          background: #fbbf24 !important;
          color: #090d16 !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .tab-btn.active-flash {
          background: #f59e0b !important;
          color: #090d16 !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        /* --- VOUCHER TICKET (VIP GOLD) --- */
        .ticket-card {
          background: #131b2e !important;
          border-radius: 16px;
          position: relative;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          height: 100%;
          min-height: 190px;
          border: 1px solid rgba(212, 175, 55, 0.25) !important;
        }

        .ticket-card:hover {
          transform: translateY(-5px);
          border-color: #fbbf24 !important;
          box-shadow: 0 10px 25px rgba(251, 191, 36, 0.15);
        }

        .ticket-left {
          background: linear-gradient(135deg, #090d16 0%, #131b2e 100%) !important;
          width: 32%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #fbbf24 !important;
          padding: 14px 8px;
          border-right: 2px dashed rgba(212, 175, 55, 0.4) !important;
          position: relative;
          text-align: center;
        }

        .ticket-card.flash-sale .ticket-left {
          background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%) !important;
          color: #ffffff !important;
        }

        .ticket-left::after,
        .ticket-right::before {
          content: "";
          position: absolute;
          background-color: #0b0f17 !important;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
        }

        .ticket-left::after {
          right: -10px;
        }

        .ticket-right::before {
          left: -10px;
          z-index: 10;
        }

        .ticket-right {
          width: 68%;
          padding: 14px 14px 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
          background: #131b2e !important;
        }

        .ticket-right h5 {
          color: #ffffff !important;
          font-weight: 700;
        }

        .ticket-right p {
          color: #94a3b8 !important;
        }

        .coupon-code {
          border: 1px dashed #fbbf24 !important;
          background: #090d16 !important;
          color: #fbbf24 !important;
          padding: 5px 12px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-weight: 800;
          font-size: 0.92rem;
          letter-spacing: 0.8px;
          display: inline-block;
          margin: 0 auto;
        }

        .btn-copy {
          background-color: #fbbf24 !important;
          color: #090d16 !important;
          border: none;
          padding: 7px 18px;
          border-radius: 18px;
          font-size: 0.78rem;
          font-weight: 800;
          transition: all 0.2s;
          white-space: nowrap;
          cursor: pointer;
        }

        .btn-copy:hover {
          background-color: #f59e0b !important;
        }

        .ticket-right .small.text-secondary {
          color: #94a3b8 !important;
        }

        /* HEADING TIÊU ĐỀ */
        h3.fw-bold {
          color: #fbbf24 !important;
        }

        .text-danger {
          color: #fbbf24 !important;
        }

        .border-top {
          border-top: 1px solid rgba(212, 175, 55, 0.2) !important;
        }

        .bg-white {
          background-color: #131b2e !important;
          border: 1px solid rgba(212, 175, 55, 0.25) !important;
        }

        .text-muted {
          color: #cbd5e1 !important;
        }

        .text-secondary {
          color: #94a3b8 !important;
        }
      `}</style>

      <div className="sale-hero">
        <div className="container">
          <h1 className="fw-bold display-4 mb-3">🎉 ĐẠI TIỆC SIÊU SALE 🎉</h1>
          <p className="lead opacity-75 mb-0">
            Săn ngàn mã giảm giá - Chốt đơn không nhìn giá!
          </p>
        </div>
      </div>

      <div className="container">
        <div className="filter-section">
          <div className="filter-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${
                  activeTab === tab.id
                    ? tab.id === "flash_sale"
                      ? "active-flash"
                      : "active"
                    : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container pb-5" id="list-voucher">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">
            <i className="fas fa-ticket-alt text-danger me-2"></i>Mã Dành Cho
            Bạn
          </h3>
        </div>

        {loadingCoupons ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-warning"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredCoupons.map((c) => {
              return (
                <div
                  className="col-12 col-sm-6 col-lg-4 col-xl-3"
                  key={c._id || c.code}
                >
                  <div
                    className={
                      c.isFlashSale ? "ticket-card flash-sale" : "ticket-card"
                    }
                  >
                    <div className="ticket-left text-center">
                      <div
                        className="fs-2 fw-bold"
                        style={{ lineHeight: "1.2" }}
                      >
                        {c.type === "percent"
                          ? `${c.discountValue || 0}%`
                          : `${(c.discountValue || 0) / 1000}K`}
                      </div>
                      <div className="small fw-bold letter-spacing-1">GIẢM</div>
                      {c.isFlashSale ? (
                        <i className="fas fa-bolt mt-3 fa-2x opacity-50"></i>
                      ) : (
                        <i className="fas fa-gift mt-3 fa-2x opacity-50"></i>
                      )}
                    </div>

                    <div className="ticket-right">
                      <div>
                        <h5 className="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
                          {c.name || "Mã giảm giá"}
                        </h5>
                        <p
                          className="text-muted small mb-3"
                          style={{ lineHeight: "1.4" }}
                        >
                          Đơn tối thiểu:{" "}
                          <strong style={{ color: "#fbbf24" }}>
                            {c.minOrderValue
                              ? c.minOrderValue.toLocaleString()
                              : 0}
                            đ
                          </strong>
                        </p>
                        <div className="d-flex align-items-center mb-3">
                          <span className="coupon-code">{c.code}</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-end mt-2">
                        <div
                          className="small text-secondary fw-500"
                          style={{ fontSize: "0.8rem" }}
                        >
                          <i className="far fa-clock me-1"></i> HSD:{" "}
                          {formatDate(c.endDate, c.isFlashSale)}
                        </div>
                        <button
                          className="btn-copy shadow-sm"
                          onClick={() => handleCopyCode(c)}
                        >
                          LƯU MÃ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!loadingCoupons && filteredCoupons.length === 0 && (
              <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm border">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
                  width="120"
                  className="mb-3 opacity-50"
                  alt="empty"
                />
                <h5 className="text-white fw-bold">Trời ơi, hết mã rồi!</h5>
                <p className="text-secondary">
                  Bạn thử chọn danh mục khác hoặc quay lại sau nhé.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="container pt-4 border-top">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">
            <i className="fas fa-fire text-danger me-2"></i>Gợi Ý Mua Sắm
          </h3>
          <Link
            to="/category"
            className="text-danger fw-bold text-decoration-none"
          >
            Xem tất cả <i className="fas fa-chevron-right ms-1"></i>
          </Link>
        </div>

        {loadingProducts ? (
          <div className="text-center py-4">
            <div className="spinner-border text-warning"></div>
          </div>
        ) : suggestedProducts.length > 0 ? (
          <div className="row g-4">
            {suggestedProducts.map((product) => (
              <div className="col-6 col-md-4 col-lg-3" key={product._id}>
                <ProCardGrid product={product} onAddToCart={addToCart} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            Chưa có sản phẩm nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalePage;