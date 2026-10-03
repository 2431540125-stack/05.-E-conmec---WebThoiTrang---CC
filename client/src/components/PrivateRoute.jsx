import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, refreshAuth } = useAuth();
  const [checked, setChecked] = useState(false);

  // Double-check auth by reading localStorage directly when route is accessed
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === "admin") {
          setChecked(true);
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    setChecked(true);
  }, []);

  if (loading || !checked) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Allow access
  return children;
};

export default PrivateRoute;
