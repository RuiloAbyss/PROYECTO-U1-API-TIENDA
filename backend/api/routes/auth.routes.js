const express = require('express')
const controller = require('../controllers/auth.controller');

const { authenticate, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authenticate, controller.getCurrentUser);

// Rutas de administración de usuarios (protegidas con admin)
router.get("/users", authenticate, isAdmin, controller.getAllUsersAdmin);
router.put("/users/:id/role", authenticate, isAdmin, controller.updateUserRole);
router.delete("/users/:id", authenticate, isAdmin, controller.deleteUserAdmin);

// Rutas antiguas (DEBUG - mantener para compatibilidad)
router.get("/users/:id", controller.getUserById);
router.put("/users/:id", controller.edit);

module.exports = router;