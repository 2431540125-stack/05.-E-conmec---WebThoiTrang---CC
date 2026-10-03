import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

// Lấy tất cả
const getAll = (params = {}) => {
  return axios.get(API_URL, { params });
};

// Lấy theo ID
const getById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

// Lấy theo category slug
const getByCategorySlug = (slug, params = {}) => {
  return axios.get(API_URL, {
    params: {
      categorySlug: slug,
      ...params,
    },
  });
};

const create = (payload) => axios.post(API_URL, payload);

const update = (id, payload) => axios.put(`${API_URL}/${id}`, payload);

const remove = (id) => axios.delete(`${API_URL}/${id}`);

export default {
  getAll,
  getById,
  getByCategorySlug,
  create,
  update,
  remove,
};
