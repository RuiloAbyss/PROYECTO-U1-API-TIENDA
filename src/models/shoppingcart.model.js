const { randomUUID } = require('node:crypto')
const Product = require('./product.model'); 
const User = require('./user.model');

//Firebase
const { db } = require("../firebase");
const cartsCollection = db.collection("shoppingCarts");

//Facturapi
const Facturapi = require('facturapi').default;
const facturapi = new Facturapi(process.env.FACTURAPI_KEY);

const IVA_RATE = 0.16; 

async function calculateCartTotals(cart) {
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

async function findAll(){
    const snapshot = await cartsCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function findById(id){
    const doc = await cartsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const cart = { id: doc.id, ...doc.data() };
    return await calculateCartTotals(cart);
}

async function findByUserId(userId){
    const user = await User.findById(userId);
    if (!user) {
        return null; 
    }
    // Excluimos la contraseña de los datos del usuario que se guardarán en el carrito
    const { password, ...userWithoutPassword } = user;

    // Buscamos un carrito activo (no pagado) para el usuario
    const snapshot = await cartsCollection.where('userId', '==', userId).where('paid', '==', false).limit(1).get();
    
    if (snapshot.empty) {
        const newCart = {
            id: randomUUID(),
            userId: userId,
            user: userWithoutPassword, // Datos del usuario agregados
            products: [],
            subtotal: 0.00, 
            iva: 0.00,      
            total: 0.00,    
            paid: false
        };
        await cartsCollection.doc(newCart.id).set(newCart);
        return newCart;
    }
    
    const doc = snapshot.docs[0];
    const cart = { id: doc.id, ...doc.data() };

    // Aseguramos que los datos del usuario en el carrito estén actualizados
    cart.user = userWithoutPassword;

    return await calculateCartTotals(cart);
}

async function addtoCart(userId, productId, quantity = 1){
    const cart = await findByUserId(userId);
    const productDetails = await Product.findById(productId);

    if (!productDetails) { // Si el producto no existe
        return { error: 'Producto no encontrado', status: 404 }; 
    }

    // Verificar si hay stock disponible
    if (productDetails.stock < quantity) {
        return { error: 'No hay suficiente stock para el producto solicitado', status: 400 };
    }

    const existingItemIndex = cart.products.findIndex(item => item.product.id === productId);

    if (existingItemIndex > -1) {
        cart.products[existingItemIndex].quantity += quantity;
    } else {
        cart.products.push({ product: productDetails, quantity: quantity });
    }
    
    const updatedCart = await calculateCartTotals(cart);
    await cartsCollection.doc(cart.id).update(updatedCart);
    return updatedCart;
}

async function removeFromCart(userId, productId) {
    const cart = await findByUserId(userId);
    const initialLength = cart.products.length;
    
    cart.products = cart.products.filter(item => item.product.id !== productId);
    const wasDeleted = cart.products.length < initialLength;
    
    if (wasDeleted) {
        const updatedCart = await calculateCartTotals(cart);
        await cartsCollection.doc(cart.id).update(updatedCart);
    }

    return wasDeleted;
}

async function clearCart(userId) {
    const cart = await findByUserId(userId);
    cart.products = [];
    const updatedCart = await calculateCartTotals(cart);
    await cartsCollection.doc(cart.id).update(updatedCart);
    return updatedCart;
}

async function checkoutCart(userId) {
    const cart = await findByUserId(userId);

    if (!cart || cart.products.length === 0) {
        return { error: 'El carrito está vacío, no se puede procesar la compra.', status: 400 };
    }

    // Descontar el stock de cada producto
    for (const item of cart.products) {
        const product = await Product.findById(item.product.id);
        if (product.stock < item.quantity) {
            return { error: `No hay suficiente stock para el producto: ${product.name}`, status: 409 };
        }
        const newStock = product.stock - item.quantity;
        await Product.updateProduct(item.product.id, { stock: newStock });
    }

    // Marcar el carrito como pagado
    cart.paid = true;
    await cartsCollection.doc(cart.id).update({ paid: true });

    // Generar la factura con Facturapi
    try {
        console.log("Generando factura en Facturapi...");
        const items = cart.products.map(item => ({
            quantity: item.quantity,
            product: item.product.id_product_facturapi, // ID de producto de Facturapi
        }));

        const invoice = await facturapi.invoices.create({
            customer: cart.user.id_client,
            items: items,
            payment_form: "03", // Transferencia electrónica de fondos
            use: "G03" // Gastos en general
        });

        console.log(`Factura ${invoice.id} creada.`);
        // Guardar el ID de la factura en el carrito
        await cartsCollection.doc(cart.id).update({ invoice_id: invoice.id });
        cart.invoice_id = invoice.id;

    } catch (error) {
        console.error("Error al generar la factura en Facturapi:", error.message);
    }

    return cart;
}

module.exports = { findAll, findById, findByUserId, addtoCart, removeFromCart, clearCart, calculateCartTotals, checkoutCart };