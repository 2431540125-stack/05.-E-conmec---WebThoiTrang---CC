import axios from 'axios';

// 1. Tạo instance (bản sao) của axios với cấu hình mặc định
const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Đường dẫn gốc (sau này đổi 1 chỗ là xong)
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Hủy request nếu server treo quá 10s
});

// 2. Interceptors (Bộ đón chặn): Xử lý TRƯỚC khi gửi request
axiosClient.interceptors.request.use(
    (config) => {
        // Sau này khi có Login, ta sẽ tự động gắn Token vào đây
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Interceptors: Xử lý SAU khi nhận response
axiosClient.interceptors.response.use(
    (response) => {
        // Trả về dữ liệu gốc (data) thay vì cả object response của axios
        return response.data; 
    },
    (error) => {
        // Xử lý lỗi tập trung (Ví dụ: Nếu 401 thì đẩy về trang login)
        console.error("Lỗi API:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;