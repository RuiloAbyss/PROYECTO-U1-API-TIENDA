const express = require("express");
const controller = require("../controllers/product.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, controller.findAll);
router.get("/:id", authenticate, controller.findById);
router.post("/", authenticate, controller.addProduct);
router.put("/:id", authenticate, controller.updateProduct);
router.delete("/:id", authenticate, controller.deleteProduct);

module.exports = router;