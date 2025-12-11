const { randomUUID } = require('node:crypto')
const Product = require('./product.model');
const User = require('./user.model');
const sgMail = require('@sendgrid/mail');
const paymentService = require('../services/paymentService');

sgMail.setApiKey('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');

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
        console.log('❌ Carrito vacío o no encontrado');
        return { error: 'El carrito está vacío, no se puede procesar la compra.', status: 400 };
    }

    console.log('✅ Carrito encontrado:', cart.id);
    
    // Verificar si el carrito ya fue procesado
    if (cart.paid) {
        console.log('⚠️  Este carrito ya fue pagado previamente');
        return cart; // Devolver el carrito ya procesado
    }

    // 1. CAPTURAR EL PAGO EN PAYPAL (ANTES DE TODO)
    console.log("🔵 Capturando pago en PayPal...");
    const paymentResult = await paymentService.captureAndRegisterPayment(orderId, userId, cart);

    if (!paymentResult.success) {
        console.log('❌ Error al capturar pago:', paymentResult.message);
        return { error: paymentResult.message || 'Error al procesar el pago', status: 402 };
    }

    console.log(`✅ Pago capturado exitosamente: ${paymentResult.paymentId}`);
    
    // Si la orden ya fue capturada antes, verificar si el carrito ya fue procesado
    if (paymentResult.alreadyCaptured && cart.paid) {
        console.log('✅ Pago ya procesado, devolviendo carrito existente');
        return cart;
    }

    // 2. Descontar el stock de cada producto (DESPUÉS DEL PAGO EXITOSO)
    console.log('📦 Descontando stock de productos...');
    for (const item of cart.products) {
        const product = await Product.findById(item.product.id);
        if (product.stock < item.quantity) {
            return { error: `No hay suficiente stock para el producto: ${product.name}`, status: 409 };
        }
        const newStock = product.stock - item.quantity;
        await Product.updateProduct(item.product.id, { stock: newStock });
    }
    console.log('✅ Stock actualizado');

    // 3. Marcar el carrito como pagado
    cart.paid = true;
    await cartsCollection.doc(cart.id).update({ 
        paid: true,
        payment_id: paymentResult.paymentId,
        payment_date: new Date().toISOString()
    });
    console.log('✅ Carrito marcado como pagado');

    // 4. Generar la factura con Facturapi (DESPUÉS DEL PAGO)
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
        cart.verification_url = invoice.verification_url; // Añadir URL para el frontend si es necesario

        // 5. Enviar correo de confirmación
        await sendConfirmationEmail(cart, invoice);

    } catch (error) {
        console.error("Error al generar la factura o enviar correo:", error.message);
        // Nota: El pago ya fue procesado, la factura es adicional
    }

    cart.payment_id = paymentResult.paymentId;
    return cart;
}

// Función auxiliar para enviar correo
async function sendConfirmationEmail(cart, invoice) {
    const userEmail = cart.user.email;

    const productsHtml = cart.products.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${item.product.name}</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">$${item.product.price}</td>
            <td style="padding: 10px; text-align: right;">$${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const msg = {
        to: userEmail,
        from: 'judimorenodu@ittepic.edu.mx',
        subject: 'Confirmación de Compra - Tienda en Línea',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h1 style="color: #2563EB; text-align: center;">¡Gracias por tu compra!</h1>
                <p>Hola <strong>${cart.user.name}</strong>, tu pedido ha sido procesado exitosamente.</p>
                
                <div style="background-color: #F9FAFB; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #374151;">Resumen del Pedido</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #E5E7EB; color: #374151;">
                                <th style="padding: 10px; text-align: left;">Producto</th>
                                <th style="padding: 10px;">Cant.</th>
                                <th style="padding: 10px; text-align: right;">Precio</th>
                                <th style="padding: 10px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 10px; text-align: right; font-weight: bold;">$${cart.total}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; border: 1px solid #BFDBFE;">
                    <h3 style="margin-top: 0; color: #1E40AF;">Información de Facturación</h3>
                    <p style="margin: 5px 0;"><strong>Folio Fiscal (UUID):</strong> ${invoice.uuid || 'Pendiente'}</p>
                </div>

                <p style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px;">
                    Si tienes dudas, contáctanos.
                </p>
            </div>
        `,
    };//<p style="margin: 5px 0;"><strong>Ver/Descargar Factura:</strong> <a href="${invoice.verification_url}" style="color: #2563EB; text-decoration: underline;" target="_blank">Haz clic aquí</a></p>

    try {
        await sgMail.send(msg);
        console.log('Correo de confirmación enviado a', userEmail);
    } catch (error) {
        console.error('Error al enviar correo SendGrid:', error);
    }
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

module.exports = { findAll, findById, findByUserId, addtoCart, removeFromCart, clearCart, calculateCartTotals, initiateCheckout, checkoutCart, updateItemQuantity };