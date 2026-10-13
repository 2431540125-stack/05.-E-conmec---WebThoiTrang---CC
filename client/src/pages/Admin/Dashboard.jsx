import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrdersChart from "../../components/common/Dashboard/OrdersChart"; 
import RevenueCategoryChart from "../../components/common/Dashboard/RevenueCategoryChart"; 
import TopProductsRevenueChart from "../../components/common/Dashboard/TopProductsRevenueChart"; 

const API = "http://localhost:5000/api/dashboard";

const formatCurrency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v || 0,
  );

const Dashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
  });

  useEffect(() => {
    fetch(`${API}/stats?t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.stats);
      })
      .catch(console.error);
  }, []);

  const statCards = [
    {
      icon: "fa-shopping-bag",
      value: stats.orders,
      label: "Tổng đơn hàng",
      iconClass: "gold",
      link: "/admin/orders",
      linkText: "Xem chi tiết",
    },
    {
      icon: "fa-money-bill-wave",
      value: formatCurrency(stats.revenue),
      label: "Doanh thu (Đã giao)",
      iconClass: "green",
      link: "/admin",
      linkText: "Xem báo cáo",
    },
    {
      icon: "fa-user-plus",
      value: stats.users,
      label: "Thành viên",
      iconClass: "purple",
      link: "/admin/users",
      linkText: "Quản lý user",
    },
    {
      icon: "fa-box-open",
      value: stats.products,
      label: "Tổng sản phẩm",
      iconClass: "blue",
      link: "/admin/products",
      linkText: "Xem chi tiết",
    },
  ];

  return (
    <div className="db-page">
      <div className="db-head">
        <div>
          <h2 className="db-title">Tổng quan báo cáo</h2>
          <p className="db-subtitle">
            Theo dõi tình hình kinh doanh, doanh thu và sản phẩm bán chạy.
          </p>
        </div>
      </div>

      {/* ===== 4 BOX THỐNG KÊ TRÊN CÙNG ===== */}
      <div className="db-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="db-stat-card">
            <div className="db-stat-main">
              <div>
                <span className="db-stat-label">{card.label}</span>
                <h3 className="db-stat-value">{card.value}</h3>
              </div>
              <div className={`db-stat-icon ${card.iconClass}`}>
                <i className={`fas ${card.icon}`} />
              </div>
            </div>

            <div className="db-stat-footer">
              <Link to={card.link} className="db-stat-link">
                <span>{card.linkText}</span>
                <i className="fas fa-arrow-circle-right" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* BIỂU ĐỒ ĐƠN HÀNG PHÍA TRÊN */}
      <div className="db-chart-wrap">
        <OrdersChart />
      </div>

      {/* 2 BIỂU ĐỒ BÊN DƯỚI - PHÂN KHUNG NỔI BẬT */}
      <div className="db-bottom-grid">
        <div className="db-chart-card">
          <RevenueCategoryChart />
        </div>
        <div className="db-chart-card">
          <TopProductsRevenueChart />
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

        .db-page {
          font-family: "Plus Jakarta Sans", sans-serif;
          background: #0b0f17;
          min-height: 100vh;
          padding: 24px;
          color: #f8fafc;
        }

        .db-head {
          margin-bottom: 22px;
        }

        .db-title {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .db-subtitle {
          margin: 6px 0 0;
          font-size: 13.5px;
          color: #94a3b8;
        }

        /* 4 BOX THỐNG KÊ VIP */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .db-stat-card {
          background: #131b2e;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease;
        }

        .db-stat-card:hover {
          transform: translateY(-2px);
          border-color: #fbbf24;
        }

        .db-stat-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .db-stat-label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 700;
          display: block;
          margin-bottom: 6px;
        }

        .db-stat-value {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          word-break: break-word;
        }

        .db-stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .db-stat-icon.gold {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.4);
        }

        .db-stat-icon.green {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .db-stat-icon.purple {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.4);
        }

        .db-stat-icon.blue {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .db-stat-footer {
          padding-top: 10px;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
        }

        .db-stat-link {
          color: #fbbf24 !important;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .db-stat-link:hover {
          color: #f59e0b !important;
          transform: translateX(3px);
        }

        /* KHUNG CHUNG BẢO VỆ CHART */
        .db-chart-wrap {
          margin-bottom: 24px;
        }

        .db-bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          align-items: stretch;
        }

        .db-chart-card {
          width: 100%;
        }

        /* ===== ĐỒNG BỘ NỀN & KHUNG CHO BẤT KỲ ĐOẠN CHART NÀO ===== */
        .db-page .card,
        .db-page [class*="card"],
        .db-page [class*="chart"],
        .db-page [class*="box"] {
          background-color: #131b2e !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
        }

        /* TỰ ĐỘNG LÀM RÕ CÁC CHỮ TIÊU ĐỀ BỊ CHÌM TỚI MỨC 100% SẮC NÉT */
        .db-page h1, .db-page h2, .db-page h3, .db-page h4, .db-page h5, .db-page h6,
        .db-page [class*="title"], .db-page [class*="head"] {
          color: #fbbf24 !important;
          font-weight: 800 !important;
        }

        /* ÉP SÁNG TẤT CẢ CÁC THẺ SPAN, P, PHÂN KHUNG Ô CON (Tuần này, Tuần trước, 0 đơn...) */
        .db-page span, 
        .db-page p, 
        .db-page div[class*="item"],
        .db-page div[class*="stat"],
        .db-page div[class*="box"] {
          color: #f1f5f9 !important;
        }

        /* SỬA RIÊNG MẤY Ô NHỎ CHỈ SỐ NHƯ "Tuần này", "Tuần trước", "TB mỗi ngày" KHÔNG BỊ BẢO HÒA TỐI */
        .db-page div[class*="stat"] > span,
        .db-page div[class*="item"] > span,
        .db-page [class*="label"],
        .db-page [class*="muted"] {
          color: #cbd5e1 !important;
          font-size: 13px !important;
          font-weight: 700 !important;
        }

        .db-page div[class*="stat"] > div,
        .db-page div[class*="item"] > div,
        .db-page [class*="value"],
        .db-page [class*="num"] {
          color: #ffffff !important;
          font-weight: 800 !important;
          font-size: 18px !important;
        }

        /* ĐIỀU CHỈNH PHÂN KHUNG CHO CÁC Ô ĐIỀU KIỆN LỌC (LỌC NGÀY/TUẦN/THÁNG) */
        .db-page button {
          background-color: #090d16 !important;
          color: #cbd5e1 !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          font-weight: 700 !important;
          border-radius: 8px !important;
        }

        .db-page button:hover,
        .db-page button.active,
        .db-page button[class*="active"] {
          background-color: #fbbf24 !important;
          color: #090d16 !important;
          font-weight: 800 !important;
          border-color: #fbbf24 !important;
        }

        @media (max-width: 1100px) {
          .db-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .db-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .db-page {
            padding: 16px;
          }

          .db-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;