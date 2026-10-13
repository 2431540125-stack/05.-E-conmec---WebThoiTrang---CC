import React, { useEffect, useMemo, useState } from "react";
import userService from "../../../services/userService";
import UserAddOrEditModal from "./UserAddOrEditModal";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const LIMIT = 10;

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const normalizeRoleValue = (role) => {
    if (!role) return "";
    const value = String(role).toLowerCase();

    if (value === "admin") return "admin";
    if (value === "manager") return "manager";
    if (value === "staff") return "staff";
    if (value === "customer") return "customer";

    return value;
  };

  const getRoleLabel = (role) => {
    const normalized = normalizeRoleValue(role);

    if (normalized === "admin") return "Quản trị viên";
    if (normalized === "manager") return "Quản lý";
    if (normalized === "staff") return "Nhân viên";
    return "Khách hàng";
  };

  const fetchUsers = async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await userService.getAll(
        page,
        LIMIT,
        searchText,
        filterRole,
        filterStatus,
      );

      if (data?.docs) {
        setUsers(data.docs);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.page || 1);
      } else {
        setUsers([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Lỗi tải users:", error);
      toast.error("Không tải được dữ liệu người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, filterRole, filterStatus]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  const handleCreateClick = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleToggleLockClick = async (id, isLocked) => {
    const confirmMessage = isLocked
      ? "Bạn có muốn mở khóa tài khoản này không?"
      : "Bạn có chắc muốn khóa tài khoản này không? Người dùng sẽ không thể đăng nhập.";

    if (window.confirm(confirmMessage)) {
      try {
        await userService.delete(id);

        toast.success(
          isLocked
            ? "Đã mở khóa tài khoản thành công!"
            : "Đã khóa tài khoản thành công!",
        );

        fetchUsers(currentPage);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Có lỗi xảy ra!");
      }
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    let result = [...users];

    if (filterStatus === "active") {
      result = result.filter((user) => !user?.isLocked);
    }

    if (filterStatus === "locked") {
      result = result.filter((user) => user?.isLocked);
    }

    return result.sort((a, b) => {
      const aLocked = a?.isLocked ? 1 : 0;
      const bLocked = b?.isLocked ? 1 : 0;

      if (aLocked !== bLocked) return aLocked - bLocked;

      const aName = a?.fullName || a?.username || "";
      const bName = b?.fullName || b?.username || "";
      return aName.localeCompare(bName, "vi", { sensitivity: "base" });
    });
  }, [users, filterStatus]);

  const getRoleBadgeClass = (role) => {
    const normalized = normalizeRoleValue(role);

    if (normalized === "admin") return "us-roleBadge us-roleAdmin";
    if (normalized === "manager") return "us-roleBadge us-roleManager";
    if (normalized === "staff") return "us-roleBadge us-roleStaff";
    return "us-roleBadge us-roleCustomer";
  };

  const getStatusBadgeClass = (isLocked) => {
    return isLocked
      ? "us-statusBadge us-statusLocked"
      : "us-statusBadge us-statusActive";
  };

  const getAvatar = (user) => {
    return user?.avatarUrl || "/dist/img/user2-160x160.jpg";
  };

  return (
    <div className="us-page">
      <section className="content-header us-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-12">
              <div className="us-head">
                <div>
                  <h1 className="us-title">Quản lý Người dùng</h1>
                  <p className="us-subtitle">
                    Quản lý tài khoản, vai trò và trạng thái hoạt động của người
                    dùng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content us-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="us-card">
                <div className="us-cardHeader">
                  <div className="us-cardTitleWrap">
                    <h3 className="us-cardTitle">Danh sách tài khoản</h3>
                    <span className="us-cardMeta">
                      Tổng hiển thị: {filteredAndSortedUsers.length} người dùng
                    </span>
                  </div>

                  <div className="us-toolbar">
                    <select
                      className="us-select"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="">Tất cả vai trò</option>
                      <option value="admin">Quản trị viên</option>
                      <option value="manager">Quản lý</option>
                      <option value="staff">Nhân viên</option>
                      <option value="customer">Khách hàng</option>
                    </select>

                    <select
                      className="us-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="active">Hoạt động</option>
                      <option value="locked">Đang khóa</option>
                    </select>

                    <div className="us-searchWrap">
                      <input
                        type="text"
                        className="us-searchInput"
                        placeholder="Tìm tên, username, email..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <button
                        type="button"
                        className="us-btn us-btnSearch"
                        onClick={handleFilter}
                        title="Tìm kiếm"
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="us-btn us-btnGhost"
                      onClick={() => fetchUsers(currentPage)}
                      title="Làm mới"
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>

                    <button
                      type="button"
                      className="us-btn us-btnPrimary"
                      onClick={handleCreateClick}
                    >
                      <i className="fas fa-plus"></i>
                      <span>Thêm user</span>
                    </button>
                  </div>
                </div>

                <div className="us-tableWrap">
                  <table className="us-table">
                    <thead>
                      <tr>
                        <th style={{ width: "6%" }}>STT</th>
                        <th style={{ width: "10%" }} className="us-center">
                          Ảnh
                        </th>
                        <th style={{ width: "22%" }}>Tên / Tài khoản</th>
                        <th style={{ width: "24%" }}>Liên hệ</th>
                        <th style={{ width: "12%" }} className="us-center">
                          Vai trò
                        </th>
                        <th style={{ width: "12%" }} className="us-center">
                          Trạng thái
                        </th>
                        <th style={{ width: "7%" }} className="us-center">
                          Sửa
                        </th>
                        <th style={{ width: "7%" }} className="us-center">
                          Khóa
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="us-emptyCell">
                            <div
                              className="spinner-border text-warning"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="us-loadingText">
                              Đang tải dữ liệu...
                            </p>
                          </td>
                        </tr>
                      ) : filteredAndSortedUsers.length > 0 ? (
                        filteredAndSortedUsers.map((user, index) => (
                          <tr
                            key={user._id}
                            className={user?.isLocked ? "us-rowLocked" : ""}
                          >
                            <td className="us-stt">
                              {(currentPage - 1) * LIMIT + index + 1}
                            </td>

                            <td className="us-center">
                              <div className="us-avatarBox">
                                <img
                                  alt="Avatar"
                                  className="us-avatar"
                                  src={getAvatar(user)}
                                />
                              </div>
                            </td>

                            <td>
                              <div className="us-mainText">
                                {user.fullName || "Chưa cập nhật tên"}
                              </div>
                              <div className="us-subText">@{user.username}</div>
                            </td>

                            <td>
                              <div className="us-contactLine">
                                <i className="fas fa-envelope fa-fw"></i>
                                <span>{user.email}</span>
                              </div>
                              <div className="us-contactLine">
                                <i className="fas fa-phone fa-fw"></i>
                                <span>{user.phoneNumber || "N/A"}</span>
                              </div>
                            </td>

                            <td className="us-center">
                              <span className={getRoleBadgeClass(user.role)}>
                                {getRoleLabel(user.role)}
                              </span>
                            </td>

                            <td className="us-center">
                              <span
                                className={getStatusBadgeClass(user.isLocked)}
                              >
                                {user.isLocked ? "Đang khóa" : "Hoạt động"}
                              </span>
                            </td>

                            <td className="us-center">
                              <button
                                className="us-btnAction us-btnEdit"
                                onClick={() => handleEditClick(user)}
                                title="Chỉnh sửa"
                              >
                                <span>Sửa</span>
                              </button>
                            </td>

                            <td className="us-center">
                              <button
                                className={`us-btnAction ${
                                  user.isLocked ? "us-btnUnlock" : "us-btnLock"
                                }`}
                                onClick={() =>
                                  handleToggleLockClick(user._id, user.isLocked)
                                }
                                title={
                                  user.isLocked
                                    ? "Mở khóa tài khoản"
                                    : "Khóa tài khoản"
                                }
                              >
                                <i
                                  className={`fas ${
                                    user.isLocked ? "fa-unlock" : "fa-lock"
                                  }`}
                                ></i>
                                <span>{user.isLocked ? "Mở" : "Khóa"}</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="us-emptyCell">
                            Không có dữ liệu người dùng.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && (
                  <div className="us-paginationWrap">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <UserAddOrEditModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        refreshData={fetchUsers}
        initialData={selectedUser}
      />

      <style jsx>{`
        .us-page {
          font-family: "Plus Jakarta Sans", sans-serif;
          background: #0b0f17;
          min-height: 100vh;
          padding: 20px 0;
          color: #f8fafc;
        }

        .us-header {
          margin-bottom: 12px;
        }

        .us-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .us-title {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .us-subtitle {
          margin: 6px 0 0;
          font-size: 13.5px;
          color: #94a3b8;
        }

        .us-content {
          padding-bottom: 20px;
        }

        .us-card {
          background: #131b2e;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .us-cardHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          background: #090d16;
        }

        .us-cardTitleWrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .us-cardTitle {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #fbbf24;
        }

        .us-cardMeta {
          font-size: 13px;
          color: #94a3b8;
        }

        .us-toolbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .us-select,
        .us-searchInput {
          height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: #090d16;
          color: #ffffff;
          font-family: "Plus Jakarta Sans", sans-serif;
          padding: 0 12px;
          outline: none;
          transition: all 0.2s ease;
          font-size: 13px;
        }

        .us-select option {
          background: #131b2e;
          color: #ffffff;
        }

        .us-select {
          min-width: 160px;
        }

        .us-searchInput {
          width: 220px;
          padding-right: 42px;
        }

        .us-select:focus,
        .us-searchInput:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.25);
        }

        .us-searchWrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .us-btn {
          height: 38px;
          border-radius: 10px;
          border: 1px solid transparent;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: "Plus Jakarta Sans", sans-serif;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .us-btnSearch {
          position: absolute;
          right: 4px;
          height: 30px;
          width: 30px;
          border-radius: 8px;
          background: #131b2e;
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #fbbf24;
          padding: 0;
        }

        .us-btnSearch:hover {
          background: #fbbf24;
          color: #090d16;
        }

        .us-btnGhost {
          background: #090d16;
          border-color: rgba(212, 175, 55, 0.3);
          color: #cbd5e1;
        }

        .us-btnGhost:hover {
          border-color: #fbbf24;
          color: #fbbf24;
        }

        .us-btnPrimary {
          background: #fbbf24;
          border-color: #fbbf24;
          color: #090d16;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.25);
        }

        .us-btnPrimary:hover {
          background: #f59e0b;
          transform: translateY(-1px);
        }

        .us-tableWrap {
          width: 100%;
          overflow-x: auto;
        }

        .us-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1140px;
          background: #131b2e;
        }

        .us-table thead th {
          background: #090d16;
          color: #fbbf24;
          font-size: 12.5px;
          font-weight: 800;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
          padding: 14px 12px;
          vertical-align: middle;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .us-table td {
          padding: 14px 12px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          font-size: 13.5px;
          color: #cbd5e1;
          vertical-align: middle;
          word-break: break-word;
          background: #131b2e;
        }

        .us-table tbody tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .us-rowLocked td {
          background: #0f1623;
          opacity: 0.8;
        }

        .us-center {
          text-align: center !important;
        }

        .us-stt {
          font-weight: 800;
          color: #fbbf24;
        }

        .us-avatarBox {
          width: 44px;
          height: 44px;
          margin: 0 auto;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: #090d16;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .us-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .us-mainText {
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
          line-height: 1.35;
        }

        .us-subText {
          color: #94a3b8;
          font-size: 12.5px;
        }

        .us-contactLine {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          color: #cbd5e1;
          line-height: 1.45;
          font-size: 13px;
        }

        .us-contactLine i {
          color: #fbbf24;
        }

        .us-roleBadge,
        .us-statusBadge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 96px;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .us-roleAdmin {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .us-roleManager {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border-color: rgba(168, 85, 247, 0.3);
        }

        .us-roleStaff {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.3);
        }

        .us-roleCustomer {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.3);
        }

        .us-statusActive {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.3);
        }

        .us-statusLocked {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .us-btnAction {
          min-width: 60px;
          height: 28px;
          padding: 0 8px;
          border-radius: 8px;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-weight: 800;
          font-size: 12px;
          font-family: "Plus Jakarta Sans", sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .us-btnEdit {
          background: #fbbf24;
          border-color: #fbbf24;
          color: #090d16;
        }

        .us-btnEdit:hover {
          background: #f59e0b;
        }

        .us-btnLock {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #f87171;
        }

        .us-btnLock:hover {
          background: rgba(239, 68, 68, 0.4);
        }

        .us-btnUnlock {
          background: #090d16;
          border-color: rgba(212, 175, 55, 0.3);
          color: #fbbf24;
        }

        .us-btnUnlock:hover {
          border-color: #fbbf24;
        }

        .us-emptyCell {
          text-align: center;
          padding: 32px 16px !important;
          color: #94a3b8;
        }

        .us-loadingText {
          margin: 10px 0 0;
          color: #fbbf24;
        }

        .us-paginationWrap {
          padding: 16px 20px;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          background: #090d16;
        }
      `}</style>
    </div>
  );
};

export default Users;