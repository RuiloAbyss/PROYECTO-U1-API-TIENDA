const ShoppingCart = require('../models/shoppingcart.model');

function getCart(req, res) {
    const userId = req.userId;
    const cart = ShoppingCart.findByUserId(userId);
    res.status(200).json(cart);
}

function addProductToCart(req, res) {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'El ID del producto es obligatorio' });
    }

    const cart = ShoppingCart.addtoCart(userId, productId, quantity);
    
    if (!cart) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(cart);
}

function removeProductFromCart(req, res) {
    const userId = req.userId;
    const productId = req.params.productId;

    const deleted = ShoppingCart.removeFromCart(userId, productId);

    if (!deleted) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
    
    res.status(204).send();
}

function clearUserCart(req, res) {
    const userId = req.userId;
    const cart = ShoppingCart.clearCart(userId);
    res.status(200).json(cart);
}

module.exports = {
    getCart,
    addProductToCart,
    removeProductFromCart,
    clearUserCart
};