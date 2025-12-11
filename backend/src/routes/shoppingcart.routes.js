const express = require("express");
const controller = require("../controllers/shoppingcart.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, controller.getCart);
router.post("/items", authenticate, controller.addProductToCart);
router.delete("/items/:productId", authenticate, controller.removeProductFromCart);
router.put("/items/:productId", authenticate, controller.updateItemQuantity);
router.delete("/", authenticate, controller.clearUserCart);

// Rutas de checkout con PayPal
router.post('/initiate-checkout', authenticate, controller.initiateCheckout);
router.post('/complete-checkout', authenticate, controller.checkout);

module.exports = router;