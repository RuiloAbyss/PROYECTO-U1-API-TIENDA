const express = require('express')
const controller = require('../controllers/auth.controller');

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authenticate, controller.getCurrentUser);

// Rutas de visualización de usuarios (DEBUG)
router.get("/users", controller.getUsers);
router.get("/users/:id", controller.getUserById);

// Rutas de administración de usuarios (DEBUG)
router.put("/users/:id", controller.edit);
router.delete("/users/:id", controller.remove);

module.exports = router;