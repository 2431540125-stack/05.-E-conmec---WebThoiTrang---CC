import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchReviews = () => {
    setLoading(true);

    fetch("http://localhost:5000/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        const list = data.docs || (Array.isArray(data) ? data : []);
        setReviews(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;

    fetch(`http://localhost:5000/api/reviews/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Đã xóa đánh giá");
          setReviews(reviews.filter((r) => r._id !== id));
        } else {
          toast.error("Lỗi khi xóa");
        }
      })
      .catch(() => toast.error("Lỗi kết nối"));
  };

  const handleApprove = (id) => {
    axios
      .put(`http://localhost:5000/api/reviews/${id}/approve`)
      .then(() => {
        toast.success("Đã duyệt đánh giá");
        fetchReviews();
      })
      .catch(() => toast.error("Lỗi duyệt"));
  };

  const handleReject = (id) => {
    axios
      .put(`http://localhost:5000/api/reviews/${id}/reject`)
      .then(() => {
        toast.warning("Đã từ chối đánh giá");
        fetchReviews();
      })
      .catch(() => toast.error("Lỗi từ chối"));
  };

  const handleChangeStatus = (id, status) => {
    if (status === "approved") handleApprove(id);
    if (status === "rejected") handleReject(id);
  };

  const openReplyModal = (id) => {
    setCurrentReviewId(id);
    setReplyContent("");
    setShowReplyModal(true);
  };

  const sendReply = () => {
    if (!replyContent) {
      toast.warning("Nhập nội dung trả lời");
      return;
    }

    axios
      .put(`http://localhost:5000/api/reviews/${currentReviewId}/reply`, {
        reply: replyContent,
      })
      .then(() => {
        toast.success("Đã trả lời khách");
        setShowReplyModal(false);
        fetchReviews();
      })
      .catch(() => toast.error("Lỗi khi gửi"));
  };

  const renderStars = (rating) => {
    let stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? "#fbbf24" : "#475569",
            fontSize: "15px",
            lineHeight: 1,
          }}
        >
          ★
        </span>,
      );
    }

    return stars;
  };

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return {
        background: "rgba(34, 197, 94, 0.15)",
        color: "#4ade80",
        border: "1px solid rgba(34, 197, 94, 0.3)",
      };
    }

    if (status === "rejected") {
      return {
        background: "rgba(239, 68, 68, 0.15)",
        color: "#f87171",
        border: "1px solid rgba(239, 68, 68, 0.3)",
      };
    }

    return {
      background: "rgba(245, 158, 11, 0.15)",
      color: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.3)",
    };
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: "#fbbf24",
          fontSize: "14px",
        }}
      >
        Đang tải đánh giá...
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: "20px",
        background: "#0b0f17",
        minHeight: "100vh",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          background: "#131b2e",
          border: "1px solid rgba(212, 175, 55, 0.25)",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            background: "#090d16",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 800,
              color: "#fbbf24",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Quản lý Đánh giá và Bình luận
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13.5px",
              color: "#94a3b8",
            }}
          >
            Theo dõi, duyệt, phản hồi và xử lý đánh giá từ khách hàng
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "1080px",
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                background: "#090d16",
              }}
            >
              <tr>
                <th style={thStyle({ width: "220px" })}>Sản phẩm</th>
                <th style={thStyle({ width: "150px" })}>Khách hàng</th>
                <th style={thStyle({ width: "120px", textAlign: "center" })}>
                  Đánh giá
                </th>
                <th style={thStyle({ minWidth: "260px" })}>
                  Nội dung bình luận
                </th>
                <th style={thStyle({ width: "120px", textAlign: "center" })}>
                  Ngày
                </th>
                <th style={thStyle({ width: "150px", textAlign: "center" })}>
                  Trạng thái
                </th>
                <th style={thStyle({ width: "180px", textAlign: "center" })}>
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((review) => (
                <tr
                  key={review._id}
                  style={{
                    background: "#131b2e",
                    borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
                  }}
                >
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <img
                        src={
                          review.product?.thumbnail ||
                          "https://via.placeholder.com/48"
                        }
                        width="48"
                        height="48"
                        style={{
                          objectFit: "cover",
                          borderRadius: 10,
                          border: "1px solid rgba(212, 175, 55, 0.3)",
                          background: "#090d16",
                          flexShrink: 0,
                        }}
                        alt=""
                      />

                      <div>
                        <div
                          style={{
                            fontSize: "13.5px",
                            fontWeight: 700,
                            color: "#ffffff",
                            lineHeight: 1.45,
                          }}
                        >
                          {review.product?.name || "Sản phẩm đã bị xóa"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#fbbf24",
                      }}
                    >
                      {review.user?.name || "Ẩn danh"}
                    </div>
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div>{renderStars(review.rating)}</div>
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      ({review.rating}/5)
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <p
                      style={{
                        margin: 0,
                        fontStyle: "italic",
                        color: "#cbd5e1",
                        fontSize: "13.5px",
                        lineHeight: 1.6,
                      }}
                    >
                      "{review.comment}"
                    </p>

                    {review.adminReply && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px 12px",
                          background: "#090d16",
                          borderLeft: "3px solid #fbbf24",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          color: "#cbd5e1",
                          lineHeight: 1.55,
                        }}
                      >
                        <b style={{ color: "#fbbf24" }}>Phản hồi admin:</b>{" "}
                        {review.adminReply}
                      </div>
                    )}
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <select
                      value={review.status}
                      onChange={(e) =>
                        handleChangeStatus(review._id, e.target.value)
                      }
                      style={{
                        ...getStatusStyle(review.status),
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="pending" style={{ background: "#131b2e", color: "#fbbf24" }}>Chờ duyệt</option>
                      <option value="approved" style={{ background: "#131b2e", color: "#4ade80" }}>Đã duyệt</option>
                      <option value="rejected" style={{ background: "#131b2e", color: "#f87171" }}>Từ chối</option>
                    </select>
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        gap: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => openReplyModal(review._id)}
                        style={{
                          background: "#fbbf24",
                          color: "#090d16",
                          border: "none",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2)",
                        }}
                      >
                        Trả lời
                      </button>

                      <button
                        onClick={() => handleDelete(review._id)}
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReplyModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            padding: "16px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              width: "460px",
              maxWidth: "100%",
              background: "#131b2e",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 18px 40px rgba(0, 0, 0, 0.5)",
              color: "#ffffff",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                color: "#fbbf24",
              }}
            >
              Trả lời đánh giá
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: "13px",
                color: "#94a3b8",
              }}
            >
              Nhập phản hồi để gửi tới khách hàng
            </p>

            <textarea
              placeholder="Nhập nội dung trả lời..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              style={{
                width: "100%",
                height: "120px",
                padding: "12px",
                marginTop: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                fontSize: "13.5px",
                color: "#ffffff",
                outline: "none",
                resize: "vertical",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: "#090d16",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "16px",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setShowReplyModal(false)}
                style={{
                  height: "38px",
                  padding: "0 16px",
                  background: "#090d16",
                  color: "#cbd5e1",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>

              <button
                onClick={sendReply}
                style={{
                  height: "38px",
                  padding: "0 18px",
                  background: "#fbbf24",
                  color: "#090d16",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(251, 191, 36, 0.25)",
                }}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = (extra = {}) => ({
  padding: "14px 12px",
  fontSize: "12.5px",
  fontWeight: "800",
  color: "#fbbf24",
  borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  ...extra,
});

const tdStyle = {
  padding: "14px 12px",
  fontSize: "13.5px",
  color: "#cbd5e1",
  verticalAlign: "middle",
};

export default AdminReviews;