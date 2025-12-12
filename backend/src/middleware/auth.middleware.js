const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const JWT_SECRET = process.env.JWT_SECRET || '1234' ;

function authenticate(req, res, next){
    const auth = req.headers.authorization;

    if(!auth ||  !auth.startsWith('Bearer'))
        return res.status(401).json({message: "No Autorizado"});

    const token = auth.split(" ")[1];
    try{
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch(error){
        return res.status(401).json({message: "No Autorizado"});
    }
}

async function isAdmin(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Acceso denegado: Se requieren permisos de administrador" });
        }

        next();
    } catch (error) {
        console.error('Error en isAdmin middleware:', error);
        return res.status(500).json({ message: "Error al verificar permisos" });
    }
}

function authorize(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso denegado: Se requieren permisos de administrador." });
    }
    next();
}

module.exports = { authenticate, authorize, isAdmin };