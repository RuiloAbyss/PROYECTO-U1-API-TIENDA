const { randomUUID } = require('node:crypto')
const Product = require('./product.model');
const User = require('./user.model');
const emailService = require('../services/emailService');
const paymentService = require('../services/paymentService');
const whatsAppService = require('../services/whatsAppService');

//Firebase
const { db } = require("../firebase");
const cartsCollection = db.collection("shoppingCarts");

//Facturapi
const Facturapi = require('facturapi').default;
const facturapi = new Facturapi(process.env.FACTURAPI_KEY);

const IVA_RATE = 0.16;

async function calculateCartTotals(cart) {
    let total = 0;

    cart.products.forEach(item => {
        total += item.product.price * item.quantity;
    });

    const subtotal = total / (1 + IVA_RATE);
    const iva = total - subtotal;

    cart.subtotal = parseFloat(subtotal.toFixed(2));
    cart.iva = parseFloat(iva.toFixed(2));
    cart.total = parseFloat(total.toFixed(2));

    if (typeof cart.paid === 'undefined') {
        cart.paid = false;
    }

    return cart;
}

async function findAll() {
    const snapshot = await cartsCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function findById(id) {
    const doc = await cartsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const cart = { id: doc.id, ...doc.data() };
    return await calculateCartTotals(cart);
}

async function findByUserId(userId) {
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

async function addtoCart(userId, productId, quantity = 1) {
    const cart = await findByUserId(userId);
    const productDetails = await Product.findById(productId);

    if (!productDetails) { // Si el producto no existe
        return { error: 'Producto no encontrado', status: 404 };
    }
    //convertir quantity a entero
    quantity = parseInt(quantity);
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

// Inicia el proceso de checkout creando la orden de pago en PayPal
async function initiateCheckout(userId) {
    const cart = await findByUserId(userId);

    if (!cart || cart.products.length === 0) {
        return { error: 'El carrito está vacío, no se puede procesar la compra.', status: 400 };
    }

    // Verificar que hay stock disponible antes de crear la orden de pago
    for (const item of cart.products) {
        const product = await Product.findById(item.product.id);
        if (product.stock < item.quantity) {
            return { error: `No hay suficiente stock para el producto: ${product.name}`, status: 409 };
        }
    }

    // Crear orden de pago en PayPal
    const paymentResult = await paymentService.createPayment(cart);

    if (!paymentResult.success) {
        return { error: paymentResult.message, status: 500 };
    }

    // Extraer el link de aprobación de PayPal
    const approvalLink = paymentResult.data.links.find(link => link.rel === 'approve');

    return {
        success: true,
        orderId: paymentResult.data.id,
        approvalUrl: approvalLink?.href,
        cartId: cart.id
    };
}

async function checkoutCart(userId, orderId) {
    console.log('🛒 Iniciando checkoutCart...');
    console.log('UserId:', userId);
    console.log('OrderId recibido:', orderId);
    
    const cart = await findByUserId(userId);

    if (!cart || cart.products.length === 0) {
        console.log('Carrito vacío o no encontrado');
        return { error: 'El carrito está vacío, no se puede procesar la compra.', status: 400 };
    }

    console.log('Carrito encontrado:', cart.id);
    
    // Verificar si el carrito ya fue procesado
    if (cart.paid) {
        console.log('Este carrito ya fue pagado previamente');
        return cart; // Devolver el carrito ya procesado
    }

    // 1. CAPTURAR EL PAGO EN PAYPAL (ANTES DE TODO)
    console.log("Capturando pago en PayPal...");
    const paymentResult = await paymentService.captureAndRegisterPayment(orderId, userId, cart);

    if (!paymentResult.success) {
        console.log('Error al capturar pago:', paymentResult.message);
        return { error: paymentResult.message || 'Error al procesar el pago', status: 402 };
    }

    console.log(`Pago capturado exitosamente`);
    
    // Si la orden ya fue capturada antes, verificar si el carrito ya fue procesado
    if (paymentResult.alreadyCaptured && cart.paid) {
        console.log('Pago ya procesado, devolviendo carrito existente');
        return cart;
    }

    // 2. Descontar el stock de cada producto (DESPUÉS DEL PAGO EXITOSO)
    console.log('Descontando stock de productos...');
    for (const item of cart.products) {
        const product = await Product.findById(item.product.id);
        if (product.stock < item.quantity) {
            return { error: `No hay suficiente stock para el producto: ${product.name}`, status: 409 };
        }
        const newStock = product.stock - item.quantity;
        await Product.updateProduct(item.product.id, { stock: newStock });
    }
    console.log('Stock actualizado');

    // 3. Marcar el carrito como pagado
    cart.paid = true;
    await cartsCollection.doc(cart.id).update({ 
        paid: true,
        payment_id: paymentResult.paymentId,
        payment_date: new Date().toISOString()
    });

    // 4. Generar la factura con Facturapi (DESPUÉS DEL PAGO)
    try {
        console.log("Generando factura...");
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

        // Guardar el ID de la factura en el carrito
        await cartsCollection.doc(cart.id).update({ invoice_id: invoice.id });
        cart.invoice_id = invoice.id;
        cart.verification_url = invoice.verification_url; // Añadir URL para el frontend si es necesario

        // 5. Enviar correo de confirmación
        await emailService.sendPurchaseConfirmationEmail(cart, invoice);

        // Nota: WhatsApp se envía opcionalmente desde el frontend

    } catch (error) {
        console.error("Error al generar la factura o enviar correo:", error.message);
        // Nota: El pago ya fue procesado, la factura es adicional
    }

    cart.payment_id = paymentResult.paymentId;
    return cart;
}

async function updateItemQuantity(userId, productId, quantity) {
    const cart = await findByUserId(userId);
    const productDetails = await Product.findById(productId);

    if (!productDetails) {
        return { error: 'Producto no encontrado', status: 404 };
    }

    quantity = parseInt(quantity);
    if (quantity <= 0) {
        return { error: 'La cantidad debe ser mayor a 0', status: 400 };
    }

    if (productDetails.stock < quantity) {
        return { error: `Stock insuficiente. Solo hay ${productDetails.stock} disponibles.`, status: 409 };
    }

    const itemIndex = cart.products.findIndex(item => item.product.id === productId);
    if (itemIndex === -1) {
        return { error: 'Producto no encontrado en el carrito', status: 404 };
    }

    cart.products[itemIndex].quantity = quantity;

    const updatedCart = await calculateCartTotals(cart);
    await cartsCollection.doc(cart.id).update(updatedCart);
    return updatedCart;
}

// Enviar confirmación de compra por WhatsApp (opcional, llamado desde frontend)
async function sendWhatsAppConfirmation(cartId, phoneNumber) {
    try {
        console.log('Enviando confirmación de compra por WhatsApp...');

        // Buscar el carrito (debe estar pagado)
        const cartDoc = await cartsCollection.doc(cartId).get();
        
        if (!cartDoc.exists) {
            return { error: 'Carrito no encontrado', status: 404 };
        }

        const cart = { id: cartDoc.id, ...cartDoc.data() };

        if (!cart.paid) {
            return { error: 'El carrito no ha sido pagado', status: 400 };
        }

        // Crear objeto de usuario temporal con el número proporcionado
        const userDataWithPhone = {
            ...cart.user,
            phone: phoneNumber
        };

        // Enviar WhatsApp usando el servicio
        const result = await whatsAppService.sendPurchaseConfirmation(cart, userDataWithPhone);

        if (result.success) {
            return { success: true};
        } else {
            return { error: result.message, status: 500 };
        }
    } catch (error) {
        console.error('Error al enviar WhatsApp:', error);
        return { error: 'Error al enviar confirmación por WhatsApp', status: 500 };
    }
}

module.exports = { findAll, findById, findByUserId, addtoCart, removeFromCart, clearCart, calculateCartTotals, initiateCheckout, checkoutCart, updateItemQuantity, sendWhatsAppConfirmation };