import React, { useState, useEffect } from "react";
import userService from "../../../services/userService";
import { toast } from "react-toastify";

const UserAddOrEditModal = ({
  show,
  handleClose,
  refreshData,
  initialData,
}) => {
  const isEditMode = !!initialData;

  const defaultState = {
    username: "",
    password: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    role: "customer",
    address: "",
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData({
          ...defaultState,
          ...initialData,
          password: "",
        });
      } else {
        setFormData(defaultState);
      }
    }
  }, [initialData, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.username || !formData.email) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
        return;
      }

      if (!isEditMode && !formData.password) {
        toast.error("Vui lòng nhập mật khẩu cho người dùng mới!");
        return;
      }

      const payload = { ...formData };

      if (isEditMode && !payload.password) {
        delete payload.password;
      }

      if (isEditMode) {
        await userService.update(initialData._id, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await userService.create(payload);
        toast.success("Tạo người dùng thành công!");
      }

      refreshData();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const showHideClassName = show ? "modal fade show" : "modal fade";
  const displayStyle = show ? { display: "block" } : { display: "none" };

  return (
    <>
      {show && <div className="modal-backdrop fade show user-backdrop"></div>}

      <div
        className={showHideClassName}
        style={displayStyle}
        id="modal-lg"
        tabIndex="-1"
      >
        <div className="user-modal-shell">
          <div className="modal-dialog modal-lg modal-dialog-centered user-modal-dialog">
            <div className="modal-content user-modal">
              <div className="modal-header border-0">
                <div className="user-modal-heading">
                  <h4 className="modal-title user-modal-title mb-1">
                    {isEditMode
                      ? "Cập nhật thông tin User"
                      : "Thêm người dùng mới"}
                  </h4>
                  <p className="user-modal-subtitle mb-0">
                    {isEditMode
                      ? "Chỉnh sửa thông tin tài khoản trong hệ thống"
                      : "Tạo tài khoản mới với đầy đủ thông tin cơ bản"}
                  </p>
                </div>

                <button
                  type="button"
                  className="close user-modal-close"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <form autoComplete="off" className="user-form">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group user-form-group">
                        <label htmlFor="username" className="user-label">
                          Tên đăng nhập <span className="text-danger">*</span>
                        </label>
                        <input
                          id="username"
                          type="text"
                          className="form-control user-input"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          disabled={isEditMode}
                          autoComplete="off"
                          placeholder="Nhập tên đăng nhập"
                        />
                      </div>

                      <div className="form-group user-form-group">
                        <label htmlFor="password" className="user-label">
                          Mật khẩu
                          {isEditMode && (
                            <small className="text-gold ml-2">
                              (Để trống nếu không đổi)
                            </small>
                          )}
                          {!isEditMode && (
                            <span className="text-danger"> *</span>
                          )}
                        </label>
                        <input
                          id="password"
                          type="password"
                          className="form-control user-input"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder={
                            isEditMode
                              ? "Nhập mật khẩu mới..."
                              : "Nhập mật khẩu"
                          }
                          autoComplete="new-password"
                        />
                      </div>

                      <div className="form-group user-form-group">
                        <label htmlFor="email" className="user-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="form-control user-input"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="email"
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group user-form-group">
                        <label htmlFor="fullName" className="user-label">
                          Họ và tên
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          className="form-control user-input"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          autoComplete="name"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div className="form-group user-form-group">
                        <label htmlFor="phoneNumber" className="user-label">
                          Số điện thoại
                        </label>
                        <input
                          id="phoneNumber"
                          type="text"
                          className="form-control user-input"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          autoComplete="tel"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div className="form-group user-form-group">
                        <label htmlFor="role" className="user-label">
                          Phân quyền
                        </label>
                        <select
                          id="role"
                          className="form-control user-input"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                        >
                          <option value="customer">Khách hàng</option>
                          <option value="staff">Nhân viên</option>
                          <option value="manager">Quản lý</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn user-btn-secondary"
                  onClick={handleClose}
                >
                  Đóng
                </button>

                <button
                  type="button"
                  className="btn user-btn-primary"
                  onClick={handleSubmit}
                >
                  {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .user-backdrop {
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .user-modal-shell {
          position: fixed;
          inset: 0;
          z-index: 1055;
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .user-modal {
          font-family: "Plus Jakarta Sans", sans-serif;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
          background: #131b2e;
          color: #ffffff;
          overflow: hidden;
        }

        .user-modal-heading {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .user-modal-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fbbf24;
          line-height: 1.2;
        }

        .user-modal-subtitle {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.45;
          margin-top: 4px;
        }

        .user-modal-close {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          background: #090d16;
          color: #fbbf24;
          opacity: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .user-modal-close:hover {
          background: #fbbf24;
          color: #090d16;
        }

        .user-form {
          width: 100%;
        }

        .user-form-group {
          margin-bottom: 1rem;
        }

        .user-label {
          font-weight: 700;
          color: #fbbf24;
          margin-bottom: 0.42rem;
          display: inline-block;
          font-size: 0.9rem;
        }

        .text-gold {
          color: #cbd5e1;
          font-weight: normal;
        }

        .user-input {
          font-family: "Plus Jakarta Sans", sans-serif;
          min-height: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: #090d16;
          color: #ffffff;
          box-shadow: none !important;
          transition: all 0.2s ease;
          padding: 0.5rem 0.8rem;
          font-size: 0.9rem;
        }

        .user-input select option {
          background: #131b2e;
          color: #ffffff;
        }

        .user-input::placeholder {
          color: #64748b;
        }

        .user-input:focus {
          border-color: #fbbf24;
          background: #090d16;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.25) !important;
        }

        .user-input:disabled {
          background: #1e293b;
          color: #64748b;
          cursor: not-allowed;
        }

        .user-btn-primary,
        .user-btn-secondary {
          border-radius: 8px;
          min-width: 98px;
          height: 38px;
          padding: 0 16px;
          font-size: 0.88rem;
          font-weight: 800;
          font-family: "Plus Jakarta Sans", sans-serif;
          margin: 0 !important;
          transition: all 0.2s ease;
        }

        .user-btn-primary {
          background-color: #fbbf24;
          border: none;
          color: #090d16;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.25);
        }

        .user-btn-primary:hover {
          background-color: #f59e0b;
          transform: translateY(-1px);
        }

        .user-btn-secondary {
          background: #090d16;
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #cbd5e1;
        }

        .user-btn-secondary:hover {
          border-color: #fbbf24;
          color: #fbbf24;
        }

        .modal-header {
          padding: 18px 20px 14px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          background: #090d16;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 14px 20px 18px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          background: #090d16;
        }
      `}</style>
    </>
  );
};

export default UserAddOrEditModal;