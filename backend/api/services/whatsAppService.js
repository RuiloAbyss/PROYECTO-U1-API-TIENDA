const whatsAppClient = require("@green-api/whatsapp-api-client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Generar mensaje de confirmación con IA (Gemini)
async function generatePurchaseConfirmation(cart, userData, retries = 2) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY no configurado, usando mensaje por defecto");
            return generateDefaultMessage(cart, userData);
        }

        // Preparar el detalle de productos
        const productsDetail = cart.products.map(item => 
            `- ${item.quantity}x ${item.product.name} (Unitario: $${item.product.price}, Total: $${(item.product.price * item.quantity).toFixed(2)})`
        ).join('\n');

        const prompt = `
Redacta un mensaje de confirmación de compra en español, breve y amigable.
Incluye (únicamente): nombre del cliente, el total pagado, y crea una lista de los productos comprados.
Importante: Excluye cualquier oración que indique generacion por IA ("claro, aquí tienes...")

Cliente: ${userData.name}
Total pagado: $${cart.total} MXN
Productos:
${productsDetail}

El mensaje debe ser cálido y profesional, confirmando que la compra fue exitosa.
`;
        // Configuración del SDK de Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Obtener el modelo
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Generar contenido
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
            return text;
        } else {
            return generateDefaultMessage(cart, userData);
        }

    } catch (err) {
        console.error("Error al generar mensaje con IA:", err.message);
        return generateDefaultMessage(cart, userData);
    }
}

// Mensaje por defecto si la IA falla
function generateDefaultMessage(cart, userData) {
    const productsList = cart.products.map(item => 
        `${item.quantity}x ${item.product.name}`
    ).join(', ');

    return `¡Hola ${userData.name}! Tu compra de $${cart.total} MXN ha sido confirmada. Productos: ${productsList}. ¡Gracias por tu preferencia!`;
}

exports.sendWhatsMessage = async (phone, message) => {
    const restAPI = whatsAppClient.restAPI({
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE,
    });

    phone = normalizeNumber(phone);

    restAPI.message.sendMessage(`${phone}@c.us`, null, message).then((data) => {
    }).catch((error) => {
        console.error('Error al enviar WhatsApp:', error);
    });
}

// Enviar confirmación de compra por WhatsApp con IA
exports.sendPurchaseConfirmation = async (cart, userData) => {
    try {
        console.log('Generando mensaje de confirmación para WhatsApp...');
        
        // Verificar credenciales de WhatsApp
        if (!process.env.ID_INSTANCE || !process.env.API_TOKEN_INSTANCE) {
            console.warn('Credenciales de WhatsApp no configuradas');
            return { success: false, message: 'WhatsApp no configurado' };
        }

        // Verificar que el usuario tenga teléfono
        if (!userData.phone) {
            console.warn('Usuario sin número de teléfono');
            return { success: false, message: 'Usuario sin teléfono' };
        }

        // Generar mensaje con IA
        const message = await generatePurchaseConfirmation(cart, userData);
        
        // Enviar mensaje
        await exports.sendWhatsMessage(userData.phone, message);
        
        console.log('Confirmación de compra enviada por WhatsApp');
        return { success: true, message: 'Mensaje enviado' };
    } catch (error) {
        console.error('Error al enviar confirmación por WhatsApp:', error);
        return { success: false, message: error.message };
    }
}

function normalizeNumber(numero) {
  // Asegurarse de que comience con +52
  if (numero.startsWith('+52')) {
    // Si después de +52 no viene el 1, lo insertamos
    if (numero[3] !== '1') {
      return numero.slice(1, 3) + '1' + numero.slice(3);
    }
  }
  return numero;
}