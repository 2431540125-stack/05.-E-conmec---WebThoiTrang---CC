import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./layadmin.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user: authUser, logout } = useAuth();

  const [user, setUser] = useState({
    name: "Admin",
    avatar: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.name || authUser.email || "Admin",
        avatar: authUser.avatar || "",
      });
    }
  }, [authUser]);

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const isActive = (path) => (location.pathname === path ? "active-link" : "");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const sidebarWidth = isCollapsed ? "70px" : "260px";

  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=random&color=fff`;

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "var(--cream-dark)" }}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        sidebarWidth={sidebarWidth}
        isActive={isActive}
        user={user}
        avatarUrl={avatarUrl}
      />

      <div
        className="flex-grow-1 d-flex flex-column transition-all"
        style={{ marginLeft: sidebarWidth }}
      >
        <Header
          user={user}
          avatarUrl={avatarUrl}
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />

        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
