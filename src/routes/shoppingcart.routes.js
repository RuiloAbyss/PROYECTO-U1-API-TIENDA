const express = require("express");
const controller = require("../controllers/shoppingcart.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, controller.getCart);
router.post("/items", authenticate, controller.addProductToCart);
router.delete("/items/:productId", authenticate, controller.removeProductFromCart);
router.delete("/", authenticate, controller.clearUserCart);

module.exports = router;