const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// ===== Public routes =====
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/best-sellers", productController.getBestSellers);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/related/:id", productController.getRelatedProducts);
router.get("/variant/:variantId", productController.getProductByVariantId);
router.get("/:id", productController.getProductById);

// ===== Admin CRUD =====
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
