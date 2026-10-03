import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("ADMIN LOGIN RESPONSE:", data);

      if (res.ok) {
        const userData = data.user ? data.user : data;

        // Check if user is admin
        if (userData.role !== "admin") {
          toast.error("Tài khoản này không phải tài khoản quản trị viên!");
          setLoading(false);
          return;
        }

        // Save token and user to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Refresh AuthContext state immediately
        refreshAuth();

        // Get userId for notification
        const userId = data?._id || data?.user?._id || userData?._id;

        // Send notification (non-blocking, don't await)
        if (userId) {
          fetch("http://localhost:5000/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: userId,
              title: "Đăng nhập Admin thành công",
              content: "Chào mừng bạn đến trang quản trị.",
              link: "/admin",
              type: "admin",
            }),
          }).catch((err) => console.error("Notification error:", err));
        }

        toast.success("Đăng nhập quản trị viên thành công!");
        navigate("/admin", { replace: true });
      } else {
        toast.error(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Lỗi kết nối Server! (Bạn đã chạy server chưa?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-right">
          <div className="admin-login-header">
            <h2>QUẢN TRỊ VIÊN</h2>
            <p>Đăng nhập vào trang quản lý</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "ĐĂNG NHẬP"}
            </button>
          </form>

          <div className="admin-login-footer">
            <p>
              Không phải quản trị viên?{" "}
              <Link to="/login">Đăng nhập khách hàng</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
