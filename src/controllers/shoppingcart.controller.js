const ShoppingCart = require('../models/shoppingcart.model');

async function getCart(req, res) {
    const userId = req.userId;
    const cart = await ShoppingCart.findByUserId(userId);
    res.status(200).json(cart);
}

async function addProductToCart(req, res) {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'El ID del producto es obligatorio' });
    }

    const result = await ShoppingCart.addtoCart(userId, productId, quantity);
    
    // Si el modelo devuelve un objeto de error
    if (result && result.error) {
        return res.status(result.status).json({ message: result.error });
    }

    res.status(200).json(result);
}


async function removeProductFromCart(req, res) {
    const userId = req.userId;
    const productId = req.params.productId;

    const deleted = await ShoppingCart.removeFromCart(userId, productId);

    if (!deleted) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
    
    res.status(204).send();
}

async function clearUserCart(req, res) {
    const userId = req.userId;
    const cart = await ShoppingCart.clearCart(userId);
    res.status(200).json(cart);
}

async function checkout(req, res) {
    const userId = req.userId;
    const result = await ShoppingCart.checkoutCart(userId);

    // Si el modelo devuelve un objeto de error
    if (result && result.error) {
        return res.status(result.status).json({ message: result.error });
    }

    res.status(200).json({ message: 'Compra finalizada con éxito', cart: result });
}

module.exports = {
    getCart,
    addProductToCart,
    removeProductFromCart,
    clearUserCart,
    checkout
};