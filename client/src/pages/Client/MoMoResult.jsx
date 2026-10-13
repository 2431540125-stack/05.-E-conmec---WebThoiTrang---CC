import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MoMoResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const resultCode = params.get("resultCode");
  const orderId    = params.get("orderId");
  const amount     = params.get("amount");
  const message    = params.get("message");

  const isSuccess = resultCode === "0";

  // Tự động chuyển trang sau 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(isSuccess ? "/" : "/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSuccess, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandAccent}>LAVIO</span>
        </div>

        {/* Icon */}
        <div style={{ ...styles.iconCircle, background: isSuccess ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)" }}>
          {isSuccess ? (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#4ade80" opacity="0.15"/>
              <path d="M14 24l8 8 12-14" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#f87171" opacity="0.15"/>
              <path d="M16 16l16 16M32 16L16 32" stroke="#f87171" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          )}
        </div>

        {/* Tiêu đề */}
        <h1 style={{ ...styles.title, color: isSuccess ? "#fbbf24" : "#f87171" }}>
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>

        {/* Chi tiết */}
        {isSuccess ? (
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mã đơn hàng</span>
              <span style={styles.infoVal}>{orderId}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Số tiền</span>
              <span style={{ ...styles.infoVal, color: "#fbbf24", fontWeight: 800 }}>
                {Number(amount).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div style={styles.divider} />
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Phương thức</span>
              <span style={styles.infoVal}>Ví MoMo</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Trạng thái</span>
              <span style={{ ...styles.infoVal, color: "#4ade80" }}>Đã thanh toán ✓</span>
            </div>
          </div>
        ) : (
          <p style={styles.errorMsg}>
            {message || "Giao dịch không thành công. Vui lòng thử lại."}
          </p>
        )}

        {/* Đếm ngược */}
        <p style={styles.countdown}>
          Tự động chuyển về {isSuccess ? "trang chủ" : "giỏ hàng"} sau{" "}
          <strong style={{ color: "#fbbf24" }}>{countdown}s</strong>
        </p>

        {/* Nút */}
        <div style={styles.btnRow}>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate("/")}
          >
            🏠 Về trang chủ
          </button>
          {isSuccess && (
            <button
              style={styles.btnSecondary}
              onClick={() => navigate("/profile")}
            >
              📦 Xem đơn hàng
            </button>
          )}
          {!isSuccess && (
            <button
              style={styles.btnSecondary}
              onClick={() => navigate("/cart")}
            >
              🛒 Quay lại giỏ hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0f17",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  card: {
    background: "#131b2e",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: 20,
    padding: "2.5rem 2rem",
    maxWidth: 460,
    width: "100%",
    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.2rem",
  },
  brand: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 4,
    color: "#ffffff",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  brandAccent: { color: "#fbbf24" },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    textAlign: "center",
  },
  infoBox: {
    width: "100%",
    background: "#090d16",
    border: "1px solid rgba(212, 175, 55, 0.25)",
    borderRadius: 12,
    padding: "0.5rem 1.2rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
  },
  infoLabel: { fontSize: 13, color: "#94a3b8" },
  infoVal: { fontSize: 14, color: "#ffffff", fontWeight: 700 },
  divider: { height: 1, background: "rgba(212, 175, 55, 0.15)" },
  errorMsg: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 10,
    padding: "12px 16px",
    width: "100%",
  },
  countdown: {
    fontSize: 13,
    color: "#94a3b8",
    margin: 0,
    textAlign: "center",
  },
  btnRow: {
    display: "flex",
    gap: 10,
    width: "100%",
  },
  btnPrimary: {
    flex: 1,
    padding: "12px 0",
    background: "#fbbf24",
    color: "#090d16",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnSecondary: {
    flex: 1,
    padding: "12px 0",
    background: "#090d16",
    color: "#fbbf24",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};
