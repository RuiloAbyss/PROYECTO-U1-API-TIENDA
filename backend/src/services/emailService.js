// services/emailService.js
const nodemailer = require("nodemailer");

// Configurar el transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envía un correo de confirmación de compra al usuario
 * @param {object} cart - El carrito con los datos de la compra
 * @param {object} invoice - La factura generada
 */
exports.sendPurchaseConfirmationEmail = async (cart, invoice) => {
  const userEmail = cart.user.email;

  const productsHtml = cart.products.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">${item.product.name}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">$${item.product.price}</td>
      <td style="padding: 10px; text-align: right;">$${(item.product.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Tienda en Línea" <${process.env.EMAIL_USER}>`,
    to: userEmail,
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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de confirmación enviado a', userEmail);
  } catch (error) {
    console.error('Error al enviar correo con Nodemailer:', error);
  }
};