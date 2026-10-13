
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Đổi đường dẫn này nếu User.js nằm ở thư mục khác
const User = require("./models/User");

dotenv.config({
  override: true,
  path: path.resolve(__dirname, ".env"),
});

const app = express();

// Cấu hình tài khoản Admin mặc định
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";

// Tự động tạo Admin nếu chưa tồn tại
async function ensureAdmin() {
  try {
    let admin = await User.findOne({
      $or: [
        { username: ADMIN_USERNAME },
        { email: ADMIN_EMAIL },
      ],
    });

    if (admin) {
      // Không tạo trùng tài khoản.
      // Không tự đổi mật khẩu của tài khoản đã tồn tại.
      if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
      }

      console.log("✅ Tài khoản Admin đã tồn tại:", admin.email);
      return;
    }

    admin = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      fullName: "Quản trị viên",
      role: "admin",
      isLocked: false,
      provider: "local",
    });

    // User.js tự mã hóa mật khẩu bằng bcryptjs khi save()
    await admin.save();

    console.log("✅ Đã tạo tài khoản Admin mặc định!");
    console.log("📧 Email:", ADMIN_EMAIL);
    console.log("👤 Username:", ADMIN_USERNAME);
  } catch (error) {
    console.error("❌ Không thể khởi tạo tài khoản Admin:", error.message);
    throw error;
  }
}

// Import routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const couponRoutes = require("./routes/couponRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const postRoutes = require("./routes/postRoutes");
const postCategoryRoutes = require("./routes/postCategoryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addressRoutes = require("./routes/addressRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const momoRoutes = require("./routes/momoRoutes");
const vnpayRoutes = require("./routes/vnpayRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/post-categories", postCategoryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/momo", momoRoutes);
app.use("/api/payment", vnpayRoutes);

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error",
  });
});

// Khởi động server sau khi kết nối DB và kiểm tra Admin
async function startServer() {
  try {
    await connectDB();
    await ensureAdmin();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Không thể khởi động server:", error.message);
    process.exit(1);
  }
}

startServer();
