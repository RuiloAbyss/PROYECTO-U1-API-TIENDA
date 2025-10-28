const { randomUUID } = require('node:crypto')
const Product = require('./product.model'); 

const IVA_RATE = 0.16; 

function calculateCartTotals(cart) {
    let subtotal = 0;
    
    cart.products.forEach(item => {
        subtotal += item.product.price * item.quantity;
    });

    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;
    cart.subtotal = parseFloat(subtotal.toFixed(2));
    cart.iva = parseFloat(iva.toFixed(2));
    cart.total = parseFloat(total.toFixed(2));
    
    if (typeof cart.paid === 'undefined') {
        cart.paid = false;
    }

    return cart;
}

let shoppingCarts = [
    {//REMOVER CUANDO SE IMPLEMENTE EN FIREBASE
        id: randomUUID(), 
        userId: '@sa_j5l0bY8bXUuJ8Fh', // ID del admon
        products: [],
        subtotal: 0.00, 
        iva: 0.00,      
        total: 0.00,    
        paid: false     
    }
];

function findAll(){
    return shoppingCarts;
}

function findById(id){
    const cart = shoppingCarts.find((c) => c.id === id) || null;
    if (cart) {
        return calculateCartTotals(cart);
    }
    return null;
}

function findByUserId(userId){
    let cart = shoppingCarts.find((c) => c.userId === userId);
    
    if (!cart) {
        cart = {
            id: randomUUID(),
            userId: userId,
            products: [],
            subtotal: 0.00, 
            iva: 0.00,      
            total: 0.00,    
            paid: false     
        };
        shoppingCarts.push(cart);
    }
    
    return calculateCartTotals(cart);
}

function addtoCart(userId, productId, quantity = 1){
    const cart = findByUserId(userId);
    const productDetails = Product.findById(productId);

    if (!productDetails) {
        return null; 
    }

    const existingItem = cart.products.find(item => item.product.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.products.push({ product: productDetails, quantity: quantity });
    }
    
    return calculateCartTotals(cart);
}

function removeFromCart(userId, productId) {
    const cart = findByUserId(userId);
    const initialLength = cart.products.length;
    
    cart.products = cart.products.filter(item => item.product.id !== productId);
    const wasDeleted = cart.products.length < initialLength;
    
    if (wasDeleted) {
        // Recalcular los totales después de eliminar
        calculateCartTotals(cart);
    }

    return wasDeleted;
}

function clearCart(userId) {
    const cart = findByUserId(userId);
    cart.products = [];
    return calculateCartTotals(cart);
}

module.exports = { findAll, findById, findByUserId, addtoCart, removeFromCart, clearCart, calculateCartTotals };