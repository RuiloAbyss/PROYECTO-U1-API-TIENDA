const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || "1234";

async function register(req, res) {
    const { email, password, name, address, tax_id } = req.body;
    if (!email || !password || !name || !address) {
        return res.status(400).json({ message: "Los campos no pueden estar vacios" });
    }
    const created = await User.createUser({ email, password, name, address, tax_id });
    if (!created) {
        return res.status(409).json({ message: "Este usuario ya existe" })
    }
    if (created.error) {
        return res.status(400).json({ message: created.error });
    }
    res.status(201).json(created);
}

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Correo o contraseña no pueden estar vacios" });
    }
    const user = await User.findByEmail(email);
    if (!user) {
        return res.status(401).json({ message: "Credenciales Inválidas" })
    }
    if (!user.isActive) {
        return res.status(403).json({ message: "Tu cuenta ha sido desactivada." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Credenciales Inválidas" }) // Se corrige el orden de status().json()
    }

    const token = jwt.sign({ id: user.id, email: email }, JWT_SECRET, { expiresIn: '30m' });
    res.status(200).json({ token: token, role: user.role });
}

async function getUsers(req, res) { // DEBUG (BORRAR DESPUES)
    const users = await User.getAllUsers();
    res.status(200).json(users);
}

async function getUserById(req, res) { // DEBUG (BORRAR DESPUES)
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const { password, ...userWithoutPass } = user;
    res.status(200).json(userWithoutPass);
}


async function edit(req, res) { // DEBUG (BORRAR DESPUES)
    const { id } = req.params;
    const { email, password, name, address, tax_id, isActive } = req.body;

    const updated = await User.editUser(id, { email, password, name, address, tax_id, isActive });

    if (!updated) {
        return res.status(404).json({ message: "Usuario no encontrado o no se pudo actualizar" });
    }

    res.status(200).json(updated);
}

async function remove(req, res) { // DEBUG (BORRAR DESPUES)
    const { id } = req.params;

    const deleted = await User.deleteUser(id);

    if (!deleted) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(204).send();
}

async function getCurrentUser(req, res) {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const { password, ...userWithoutPass } = user;
    res.status(200).json(userWithoutPass);
}

async function getAllUsersAdmin(req, res) {
    try {
        const users = await User.getAllUsers();
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        res.status(200).json(usersWithoutPasswords);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
}

async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: "Rol inválido. Debe ser 'admin' o 'user'" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const updated = await User.editUser(id, { role });

        if (!updated) {
            return res.status(500).json({ message: "No se pudo actualizar el rol" });
        }

        res.status(200).json({ message: "Rol actualizado correctamente", user: updated });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ message: "Error al actualizar rol" });
    }
}

async function deleteUserAdmin(req, res) {
    try {
        const { id } = req.params;

        // No permitir borrar el propio usuario admin
        if (id === req.userId) {
            return res.status(403).json({ message: "No puedes eliminar tu propia cuenta" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const deleted = await User.deleteUser(id);

        if (!deleted) {
            return res.status(500).json({ message: "No se pudo eliminar el usuario" });
        }

        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
}

module.exports = {
    register,
    login,
    getUsers,
    getUserById,
    edit,
    remove,
    getCurrentUser,
    getAllUsersAdmin,
    updateUserRole,
    deleteUserAdmin
}
