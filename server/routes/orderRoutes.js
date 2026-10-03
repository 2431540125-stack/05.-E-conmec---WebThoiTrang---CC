const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const orderController = require("../controllers/orderController");

// ==============================
// HELPERS
// ==============================
function normalizePaymentMethod(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (raw === "cod") return "COD";
  if (raw === "momo") return "MOMO";
  if (raw === "vnpay") return "VNPAY";
  if (raw === "banking" || raw === "bank") return "BANKING";
  return "COD";
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || "").trim());
}

function extractObjectId(...values) {
  for (const value of values) {
    if (!value) continue;

    if (typeof value === "string" && isValidObjectId(value)) {
      return String(value).trim();
    }

    if (typeof value === "object") {
      if (typeof value._id === "string" && isValidObjectId(value._id)) {
        return String(value._id).trim();
      }
      if (typeof value.id === "string" && isValidObjectId(value.id)) {
        return String(value.id).trim();
      }
    }
  }
  return null;
}

// ==============================
// TEST API
// ==============================
router.get("/test", (req, res) => {
  res.send("Order API working");
});

// ==============================
// TẠO ĐƠN HÀNG
// ==============================
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      items,
      totalPrice,
      subtotal,
      shippingFee,
      productDiscount,
      shippingDiscount,
      vouchers,
      name,
      phone,
      address,
      city,
      district,
      ward,
      note,
      paymentMethod,
    } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm" });
    }

    const details = [];

    for (const item of items) {
      const productId = extractObjectId(item?.productId);
      const quantity = toNumber(item?.quantity, 1);
      const unitPrice = toNumber(item?.price, 0);

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({ message: "Sản phẩm không tồn tại" });
      }

      details.push({
        productId,
        productName: product.name,
        thumbnail: product.thumbnail || "",
        categoryId: product.categoryId,
        categoryName: product.categoryName || "",
        quantity,
        unitPrice,
      });
    }

    const finalAmount = toNumber(totalPrice, 0);

    const newOrder = new Order({
      userId,
      shippingAddress: {
        fullName: name,
        phoneNumber: phone,
        fullAddress: address,
        city,
        district,
        ward,
      },
      totalPrice: subtotal,
      shippingFee,
      discountAmount: productDiscount + shippingDiscount,
      finalAmount,
      paymentMethod: normalizePaymentMethod(paymentMethod),
      paymentStatus: "Unpaid",
      customerNote: note,
      details,
      history: [
        {
          status: "Pending",
          note: "Đơn hàng được tạo",
          timestamp: new Date(),
        },
      ],
    });

    await newOrder.save();

    return res.status(201).json({
      message: "Đặt hàng thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==============================
// LẤY ĐƠN USER
// ==============================
router.get("/my-orders/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId });
  res.json(orders);
});

// ==============================
// ADMIN - LẤY TẤT CẢ ĐƠN
// ==============================
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// ==============================
// UPDATE STATUS
// ==============================
router.patch("/:orderId/status", async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.orderId);
  order.status = status;
  await order.save();
  res.json(order);
});

// ==============================
// DELIVERED
// ==============================
router.patch("/:orderId/delivered", orderController.markDelivered);

// ==============================
// ADMIN NOTE
// ==============================
router.post("/:orderId/admin-note", orderController.addAdminNote);

// ==============================
// PAYMENT STATUS
// ==============================
router.patch("/:orderId/payment", orderController.updatePaymentStatus);

// ==============================
// DELETE
// ==============================
router.delete("/:orderId", async (req, res) => {
  await Order.findByIdAndDelete(req.params.orderId);
  res.json({ message: "Deleted" });
});

module.exports = router;
