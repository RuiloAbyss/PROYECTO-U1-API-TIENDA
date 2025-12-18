const express = require("express");
const controller = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, controller.findAll);
router.get("/:id", authenticate, controller.findById);

router.post("/", authenticate, authorize, controller.addProduct);
router.put("/:id", authenticate, authorize, controller.updateProduct);
router.delete("/:id", authenticate, authorize, controller.deleteProduct);

module.exports = router;