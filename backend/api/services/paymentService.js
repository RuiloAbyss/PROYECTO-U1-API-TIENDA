// services/paymentService.js
const axios = require("axios");
const { paymentsCollection } = require("../models/payments");
const User = require("../models/user.model");

const CLIENT = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // cambiar a live en producción
const URL_FRONT = process.env.ALLOWED_HOSTS

const getAccessToken = async () => {
  try {
    console.log('Solicitando access token de PayPal...');
    console.log('Client ID:', CLIENT ? `${CLIENT.substring(0, 10)}...` : 'NO CONFIGURADO');
    console.log('Secret:', SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO');
    
    const auth = Buffer.from(`${CLIENT}:${SECRET}`).toString("base64");
    const res = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res.data.access_token;
  } catch (error) {
    console.error('Error al obtener access token:', error?.response?.data || error.message);
    throw error;
  }
};

//Servicio para capturar y registrar pago del carrito
exports.captureAndRegisterPayment = async (orderId, userId, cart) => {
  try {
    console.log('Iniciando captura de pago...');
    console.log('OrderId:', orderId);
    console.log('UserId:', userId);
    console.log('Cart Total:', cart.total);
    
    const accessToken = await getAccessToken();

    const captureRes = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log('Pago capturado en PayPal');
    const transaction = captureRes.data.purchase_units[0].payments.captures[0];

    //Consultar nombre del usuario
    const userData = await User.findById(userId);
    if (!userData) {
      throw new Error('Usuario no encontrado');
    }

    // Crear descripción de productos comprados
    const productsDescription = cart.products.map(item => 
      `${item.product.name} (x${item.quantity})`
    ).join(', ');

    // Guardar en Firestore
    const paymentId = `payment_${Date.now()}`;
    await paymentsCollection.doc(paymentId).set({
      client_id: userId,
      client_name: `${userData.name}`,
      details: productsDescription,
      amount: parseFloat(cart.total),
      date: new Date().toISOString(),
      method: "PayPal",
      status: transaction.status.toLowerCase(),
      cart_id: cart.id,
    });

    return { success: true, paymentId, transaction };
  } catch (error) {
    console.error("Error al capturar pago:", error?.response?.data || error.message);
    
    // Si la orden ya fue capturada, PayPal devuelve un error específico
    if (error?.response?.data?.name === 'UNPROCESSABLE_ENTITY' && 
        error?.response?.data?.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
      console.log('La orden ya fue capturada previamente');
      // Buscar el pago existente en Firestore
      const existingPayment = await paymentsCollection.where('cart_id', '==', cart.id).limit(1).get();
      if (!existingPayment.empty) {
        const paymentDoc = existingPayment.docs[0];
        return { success: true, paymentId: paymentDoc.id, alreadyCaptured: true };
      }
    }
    
    if (error?.response?.data) {
      console.error("Detalles del error de PayPal:", JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, message: "Error al capturar el pago" };
  }
};


exports.createPayment = async (cart) => {
  try {
    const accessToken = await getAccessToken();

    // Crear descripción de productos
    const itemsDescription = cart.products.map(item => 
      `${item.product.name} (x${item.quantity})`
    ).join(', ');

    const res = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "MXN",
              value: cart.total.toFixed(2),
            },
            description: `Compra de ${cart.products.length} producto(s): ${itemsDescription}`,
          }
        ],
        application_context: {
          return_url: `${URL_FRONT}/checkout/success?cartId=${cart.id}`, // URL a la que PayPal redirige tras aprobar
          cancel_url: `${URL_FRONT}/cart`, // URL a la que redirige si se cancela
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error al crear pago con PayPal:", error.response?.data || error);
    return { success: false, message: "Error al iniciar pago con PayPal" };
  }
};

exports.getPayments = async () => {
  try {
    const snapshot = await paymentsCollection.get();
    const payments = [];
    snapshot.forEach(doc => {
      payments.push(doc.data())
    })
    if (payments){
      return { success: true, data: payments, status: 200 };
    }
    else{
      return { success: false, data: payments, status: 404};
    }
  }catch (error){
      console.error('Error al obtener pagos:', error);
      return { success: false, message: "Error al obtener los pagos" };
  }
}


