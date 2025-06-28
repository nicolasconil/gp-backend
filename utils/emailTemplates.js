export const verificationEmailTemplate = (name, url) => ({
  subject: 'Verifica tu correo en GP Footwear',
  text: `¡Hola ${name}! Verificá tu correo copiando y pegando este enlace en tu navegador:\n\n${url}`,
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <img src="https://imgur.com/xPXwqNk" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
        <h2 style="text-align: center; color: #333;">¡Hola ${name}!</h2>
        <p style="font-size: 16px; color: #555;">Gracias por registrarte en <strong>GP Footwear</strong>. Para completar tu registro, hacé click en el botón a continuación:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #4CAF50; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verificar mi correo
          </a>
        </div>
        <p style="font-size: 14px; color: #999;">Si no solicitaste este correo, podés ignorarlo.</p>
      </div>
    </div>
  `
});

export const passwordResetEmailTemplate = (name, url) => ({
  subject: 'Recuperación de contraseña - GP Footwear',
  text: `¡Hola ${name}! Solicitaste restablecer tu contraseña. Usá este enlace:\n\n${url}`,
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <img src="https://imgur.com/xPXwqNk" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
        <h2 style="text-align: center; color: #333;">¡Hola ${name}!</h2>
        <p style="font-size: 16px; color: #555;">Recibimos una solicitud para restablecer tu contraseña. Si fuiste vos, hacé click en el botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #f44336; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Restablecer contraseña
          </a>
        </div>
        <p style="font-size: 14px; color: #999;">Si no solicitaste este cambio, podés ignorar este mensaje.</p>
      </div>
    </div>
  `
});

export const orderConfirmationEmailTemplate = (name, orderId, total, cancelUrl) => ({
  subject: `Tu pedido ${orderId} ha sido recibido`,
  text: `¡Hola ${name}! Gracias por tu compra. Tu total es $${total}. Adjuntamos la factura.\n\nSi necesitás cancelar tu pedido antes de que sea procesado, podés hacerlo aquí:\n${cancelUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <img src="https://imgur.com/xPXwqNk" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
        <h2 style="text-align: center; color: #333;">Gracias por tu compra, ${name}!</h2>
        <p style="font-size: 16px; color: #555;">Recibimos tu pedido <strong>#${orderId}</strong>.</p>
        <p style="font-size: 16px; color: #555;">Importe total: <strong>$${total}</strong></p>
        <p style="font-size: 14px; color: #999;">Adjuntamos la factura en PDF. Te avisaremos cuando tu pedido esté en camino.</p>
        <hr />
        <p style="font-size: 16px; color: #555;">¿Querés cancelar tu pedido? Hacelo antes de que sea procesado:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${cancelUrl}" style="background-color: #e53935; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Cancelar pedido
          </a>
        </div>
      </div>
    </div>
  `
});


export const sendShippingNotificationEmailTemplate = (name, orderId, trackingNumber, carrier) => ({
  subject: `Tu pedido ${orderId} fue enviado 🚚`,
  text: `¡Hola ${name}! Tu pedido fue despachado.\nTransportista: ${carrier || 'No disponible'}\nNúmero de seguimiento: ${trackingNumber || 'No disponible'}`,
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <img src="https://imgur.com/xPXwqNk" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
        <h2 style="text-align: center; color: #333;">¡Hola ${name}!</h2>
        <p style="font-size: 16px; color: #555;">Tu pedido <strong>#${orderId}</strong> ya fue despachado.</p>
        <p style="font-size: 16px; color: #555;">Transportista: <strong>${carrier || 'No disponible'}</strong></p>
        <p style="font-size: 16px; color: #555;">N° de seguimiento: <strong>${trackingNumber || 'No disponible'}</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.correoargentino.com.ar/formularios/ondnc" style="background-color: #4CAF50; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px;">
            Seguir mi envío
          </a>
        </div>
        <p style="font-size: 14px; color: #999;">Gracias por confiar en GP Footwear.</p>
      </div>
    </div>
  `
});

export const promoEmailTemplate = (subject, content) => `
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <img src="https://imgur.com/xPXwqNk" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
        <h2 style="color: #2c3e50; text-align: center;">${subject}</h2>
        <div style="padding: 20px; font-size: 16px; line-height: 1.6; color: #333;">
          ${content}
        </div>
        <footer style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p style="color: #7f8c8d;">Gracias por ser parte de nuestra comunidad.</p>
          <p style="color: #7f8c8d;">Si no deseas recibir más promociones, podés darte de baja.</p>
        </footer>
      </div>
    </body>
  </html>
`;
