import React, { useEffect, useMemo, useState } from "react";
import categoryService from "../../../services/categoryService";
import {
  createCategoryList,
  flattenCategoriesForTable,
} from "../../../Utils/dataUtils";
import { toast } from "react-toastify";

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "", parentId: "" });
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoryService.getAll();
      const rawData = Array.isArray(response)
        ? response
        : response.categories || [];

      setCategories(rawData);

      const categoryTree = createCategoryList(rawData);
      const flatTable = flattenCategoriesForTable(categoryTree);
      setTableData(flatTable);
    } catch (error) {
      toast.error("Lỗi: Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      parentId: formData.parentId === "" ? null : formData.parentId,
    };

    try {
      if (isEdit) {
        await categoryService.update(editId, payload);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoryService.create(payload);
        toast.success("Thêm mới danh mục thành công!");
      }

      setShowModal(false);
      setFormData({ name: "", parentId: "" });
      setEditId(null);
      fetchCategories();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryService.delete(id);
        toast.success("Đã xóa danh mục thành công!");
        fetchCategories();
      } catch (error) {
        toast.error(
          "Không thể xóa. Có thể danh mục này đang chứa sản phẩm hoặc danh mục con.",
        );
      }
    }
  };

  const handleOpenModal = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", parentId: "" });
    setShowModal(true);
  };

  const handleEditClick = (cat) => {
    setIsEdit(true);
    setEditId(cat._id);
    setFormData({
      name: cat.name,
      parentId: cat.parentId || "",
    });
    setShowModal(true);
  };

  const renderOptions = (treeNodes, level = 0) => {
    let options = [];

    for (let node of treeNodes) {
      if (isEdit && node._id === editId) continue;

      const prefix = level === 0 ? "" : "--".repeat(level) + " ";

      options.push(
        <option key={node._id} value={node._id} style={{ background: "#131b2e", color: "#ffffff" }}>
          {prefix + node.name}
        </option>,
      );

      if (node.children && node.children.length > 0) {
        options.push(...renderOptions(node.children, level + 1));
      }
    }
    return options;
  };

  const categoryTreeForDropdown = createCategoryList(categories);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((item) => {
      map.set(String(item._id), item);
    });
    return map;
  }, [categories]);

  const stats = useMemo(() => {
    const total = tableData.length;
    const rootCount = tableData.filter((item) => item.level === 0).length;
    const childCount = tableData.filter((item) => item.level > 0).length;

    return { total, rootCount, childCount };
  }, [tableData]);

  const filteredTableData = useMemo(() => {
    let result = [...tableData];

    const keyword = searchText.trim().toLowerCase();
    if (keyword) {
      result = result.filter((cat) => {
        const parentName =
          cat.parentId && categoryMap.get(String(cat.parentId))
            ? categoryMap.get(String(cat.parentId)).name || ""
            : "";

        return (
          String(cat.name || "")
            .toLowerCase()
            .includes(keyword) ||
          String(cat.slug || "")
            .toLowerCase()
            .includes(keyword) ||
          String(parentName).toLowerCase().includes(keyword)
        );
      });
    }

    if (filterType === "root") {
      result = result.filter((cat) => cat.level === 0);
    }

    if (filterType === "child") {
      result = result.filter((cat) => cat.level > 0);
    }

    return result;
  }, [tableData, searchText, filterType, categoryMap]);

  const getParentName = (cat) => {
    if (!cat.parentId) return "—";
    const parent = categoryMap.get(String(cat.parentId));
    return parent?.name || "—";
  };

  const getLevelLabel = (level) => {
    if (level === 0) return "Gốc";
    return `Cấp ${level + 1}`;
  };

  return (
    <div className="ac-page">
      <div className="ac-head">
        <div>
          <h2 className="ac-title">Danh mục</h2>
          <p className="ac-subtitle">
            Quản lý danh mục gốc, danh mục con và cấu trúc hiển thị sản phẩm.
          </p>
        </div>

        <div className="ac-actions">
          <button className="ac-btn ac-btnPrimary" onClick={handleOpenModal}>
            + Thêm danh mục
          </button>
        </div>
      </div>

      <div className="ac-stats">
        <div className="ac-statCard">
          <div className="ac-statLabel">Tổng danh mục</div>
          <div className="ac-statValue">{stats.total}</div>
        </div>

        <div className="ac-statCard">
          <div className="ac-statLabel">Danh mục gốc</div>
          <div className="ac-statValue">{stats.rootCount}</div>
        </div>

        <div className="ac-statCard">
          <div className="ac-statLabel">Danh mục con</div>
          <div className="ac-statValue">{stats.childCount}</div>
        </div>
      </div>

      <div className="ac-toolbar">
        <div className="ac-field">
          <span className="ac-label">Tìm kiếm</span>
          <input
            className="ac-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Nhập tên danh mục, slug, danh mục cha..."
          />
        </div>

        <div className="ac-field">
          <span className="ac-label">Loại danh mục</span>
          <select
            className="ac-input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="" style={{ background: "#131b2e", color: "#ffffff" }}>-- Tất cả --</option>
            <option value="root" style={{ background: "#131b2e", color: "#ffffff" }}>Danh mục gốc</option>
            <option value="child" style={{ background: "#131b2e", color: "#ffffff" }}>Danh mục con</option>
          </select>
        </div>

        <div className="ac-field ac-fieldRight">
          <span className="ac-label">Hiển thị</span>
          <div className="ac-statBox">
            <span className="ac-badge ac-badgeInfo">
              {filteredTableData.length} mục
            </span>
          </div>
        </div>
      </div>

      <div className="ac-card">
        <div className="ac-tableWrap">
          <table className="ac-table">
            <thead>
              <tr>
                <th className="ac-center" style={{ width: "7%" }}>
                  #
                </th>
                <th style={{ width: "30%" }}>Tên danh mục</th>
                <th style={{ width: "21%" }}>Danh mục cha</th>
                <th className="ac-center" style={{ width: "12%" }}>
                  Cấp độ
                </th>
                <th style={{ width: "15%" }}>Slug</th>
                <th className="ac-center" style={{ width: "15%" }}>
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="ac-muted ac-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredTableData.length > 0 ? (
                filteredTableData.map((cat, index) => (
                  <tr key={cat._id}>
                    <td className="ac-center ac-stt">{index + 1}</td>

                    <td>
                      <div
                        className="ac-nameCell"
                        style={{ paddingLeft: `${cat.level * 24}px` }}
                      >
                        {cat.level > 0 && (
                          <i className="fas fa-level-up-alt fa-rotate-90 ac-levelIcon"></i>
                        )}

                        <span
                          className={
                            cat.level === 0 ? "ac-rootName" : "ac-childName"
                          }
                        >
                          {cat.name}
                        </span>

                        {cat.level === 0 && (
                          <span className="ac-badge ac-badgeSuccess">Gốc</span>
                        )}
                      </div>
                    </td>

                    <td>{getParentName(cat)}</td>

                    <td className="ac-center">
                      <span className="ac-badge ac-badgeSoft">
                        {getLevelLabel(cat.level)}
                      </span>
                    </td>

                    <td className="ac-mono">{cat.slug}</td>

                    <td className="ac-center">
                      <div className="ac-actionGroup ac-actionGroupCenter">
                        <button
                          className="ac-btn ac-btnEdit"
                          onClick={() => handleEditClick(cat)}
                        >
                          Sửa
                        </button>

                        <button
                          className="ac-btn ac-btnDanger"
                          onClick={() => handleDelete(cat._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="ac-muted ac-center">
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="ac-modalBackdrop"
          onMouseDown={() => setShowModal(false)}
        >
          <div className="ac-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ac-modalHead">
              <h3 className="ac-modalTitle">
                {isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}
              </h3>

              <button
                type="button"
                className="ac-btn ac-btnGhost"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form className="ac-form" onSubmit={handleSubmit}>
              <div className="ac-grid">
                <div className="ac-field ac-fieldFull">
                  <span className="ac-label">
                    Tên danh mục <span className="ac-required">*</span>
                  </span>
                  <input
                    type="text"
                    className="ac-input"
                    placeholder="Ví dụ: Thời trang nam"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="ac-field ac-fieldFull">
                  <span className="ac-label">Danh mục cha</span>
                  <select
                    className="ac-input"
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value })
                    }
                  >
                    <option value="" style={{ background: "#131b2e", color: "#ffffff" }}>
                      -- Là danh mục gốc (Không có cha) --
                    </option>
                    {renderOptions(categoryTreeForDropdown)}
                  </select>

                  <small className="ac-helpText">
                    Chọn danh mục cấp trên nếu đây là danh mục con.
                  </small>
                </div>
              </div>

              <div className="ac-formActions">
                <button
                  type="button"
                  className="ac-btn ac-btnGhost"
                  onClick={() => setShowModal(false)}
                >
                  Huỷ
                </button>

                <button type="submit" className="ac-btn ac-btnPrimary">
                  {isEdit ? "Lưu cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .ac-page {
          font-family: "Plus Jakarta Sans", sans-serif;
          animation: acFadeIn 0.25s ease-in-out;
          background: #0b0f17;
          min-height: 100vh;
          padding: 24px;
          color: #f8fafc;
        }

        @keyframes acFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ac-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .ac-title {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ac-subtitle {
          margin: 6px 0 0;
          font-size: 13.5px;
          line-height: 1.5;
          color: #94a3b8;
        }

        .ac-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ac-btn {
          font-family: "Plus Jakarta Sans", sans-serif;
          min-height: 40px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          transition: all 0.2s ease;
          user-select: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .ac-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ac-btnPrimary {
          background: #fbbf24;
          border-color: #fbbf24;
          color: #090d16;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.25);
        }

        .ac-btnPrimary:hover {
          background: #f59e0b;
          border-color: #f59e0b;
          transform: translateY(-1px);
        }

        .ac-btnGhost {
          background: #090d16;
          border-color: rgba(212, 175, 55, 0.3);
          color: #cbd5e1;
        }

        .ac-btnGhost:hover {
          border-color: #fbbf24;
          color: #fbbf24;
        }

        .ac-btnEdit {
          min-width: 60px;
          height: 30px;
          min-height: 30px;
          background: #fbbf24;
          border-color: #fbbf24;
          color: #090d16;
          font-weight: 800;
        }

        .ac-btnEdit:hover {
          background: #f59e0b;
        }

        .ac-btnDanger {
          min-width: 60px;
          height: 30px;
          min-height: 30px;
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #f87171;
          font-weight: 800;
        }

        .ac-btnDanger:hover {
          background: rgba(239, 68, 68, 0.4);
        }

        .ac-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin: 20px 0 16px;
        }

        .ac-statCard {
          background: #131b2e;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .ac-statLabel {
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .ac-statValue {
          font-size: 28px;
          font-weight: 800;
          color: #fbbf24;
          line-height: 1;
        }

        .ac-toolbar {
          display: grid;
          grid-template-columns: 1.3fr 1fr auto;
          gap: 14px;
          align-items: end;
          background: #131b2e;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 16px;
          padding: 16px;
          margin: 0 0 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .ac-statBox {
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .ac-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 18px 16px;
          align-items: start;
        }

        .ac-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .ac-fieldFull {
          grid-column: 1 / -1;
        }

        .ac-fieldRight {
          margin-left: auto;
          min-width: auto;
          align-items: flex-end;
        }

        .ac-label {
          font-size: 13.5px;
          font-weight: 700;
          color: #fbbf24;
          line-height: 1.4;
        }

        .ac-required {
          color: #f87171;
        }

        .ac-input {
          font-family: "Plus Jakarta Sans", sans-serif;
          height: 40px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          outline: none;
          background: #090d16;
          color: #ffffff;
          font-size: 13.5px;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .ac-input:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.25);
        }

        .ac-input::placeholder {
          color: #64748b;
        }

        .ac-helpText {
          margin-top: 2px;
          font-size: 12px;
          color: #94a3b8;
        }

        .ac-card {
          background: #131b2e;
          border-radius: 18px;
          border: 1px solid rgba(212, 175, 55, 0.25);
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .ac-tableWrap {
          width: 100%;
          overflow: auto;
        }

        .ac-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 920px;
          background: #131b2e;
        }

        .ac-table thead th {
          background: #090d16;
          color: #fbbf24;
          font-size: 12.5px;
          font-weight: 800;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
          padding: 14px 12px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ac-table td {
          padding: 14px 12px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          font-size: 13.5px;
          color: #cbd5e1;
          vertical-align: middle;
          word-break: break-word;
        }

        .ac-table tbody tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .ac-stt {
          font-weight: 800;
          color: #fbbf24;
        }

        .ac-center {
          text-align: center !important;
        }

        .ac-muted {
          color: #94a3b8 !important;
        }

        .ac-mono {
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 13px;
          color: #94a3b8;
        }

        .ac-nameCell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ac-levelIcon {
          color: #fbbf24;
          font-size: 12px;
          flex-shrink: 0;
        }

        .ac-rootName {
          font-weight: 800;
          color: #ffffff;
        }

        .ac-childName {
          font-weight: 600;
          color: #cbd5e1;
        }

        .ac-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 24px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 800;
          border: 1px solid transparent;
          font-family: "Plus Jakarta Sans", sans-serif;
          line-height: 1;
        }

        .ac-badgeSuccess {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.3);
        }

        .ac-badgeInfo {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.3);
        }

        .ac-badgeSoft {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          min-height: 26px;
          padding: 0 10px;
          font-size: 11.5px;
          font-weight: 800;
        }

        .ac-actionGroup {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ac-actionGroupCenter {
          justify-content: center;
        }

        .ac-modalBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .ac-modal {
          width: 560px;
          max-width: 94%;
          max-height: 90vh;
          background: #131b2e;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(212, 175, 55, 0.25);
          color: #ffffff;
        }

        .ac-modalHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          flex-shrink: 0;
          background: #090d16;
        }

        .ac-modalTitle {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #fbbf24;
          font-family: "Plus Jakarta Sans", sans-serif;
        }

        .ac-form {
          padding: 20px;
          overflow-y: auto;
          flex: 1 1 auto;
          min-height: 0;
          font-family: "Plus Jakarta Sans", sans-serif;
        }

        .ac-formActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px 18px;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          background: #090d16;
          position: sticky;
          bottom: 0;
          z-index: 2;
        }

        @media (max-width: 900px) {
          .ac-stats {
            grid-template-columns: 1fr;
          }

          .ac-toolbar {
            grid-template-columns: 1fr;
          }

          .ac-fieldRight {
            margin-left: 0;
            align-items: flex-start;
          }
        }

        @media (max-width: 820px) {
          .ac-table {
            min-width: 780px;
          }

          .ac-modal {
            width: 100%;
            max-width: 100%;
            max-height: 94vh;
            border-radius: 14px;
          }

          .ac-formActions {
            flex-wrap: wrap;
          }

          .ac-formActions .ac-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCategory;