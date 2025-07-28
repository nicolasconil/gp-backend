const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

export const orderConfirmationEmailTemplate = (order) => {
  const {
    _id: orderId,
    guestName,
    totalAmount,
    shipping = {},
    guestAddress = {}
  } = order;
  const { status } = shipping;
  const address = guestAddress.street
    ? `${guestAddress.street} ${guestAddress.number || ''}, ${guestAddress.city || ''}, ${guestAddress.province || ''}, CP ${guestAddress.postalCode || ''}`
    : 'Dirección no disponible';
  const cancelUrl = `${process.env.FRONTEND_URL}/cancelar/${order.cancelToken}`;
  const viewOrderUrl = `${process.env.FRONTEND_URL}/seguimiento/${orderId}`;

  return {
    subject: `Tu pedido #${orderId} ha sido recibido`,
    text: `¡Hola ${guestName}! Gracias por tu compra. Tu total es $${order.products.reduce((acc, p) => acc + p.price * p.quantity, 0)}. Adjuntamos el comprobante de compra.\n\nEstado de envío: ${status || 'Pendiente'}\nDirección de entrega: ${address}\n\nPodés ver el estado de tu pedido acá:\n${viewOrderUrl}\n\nSi necesitás cancelar tu pedido antes de que sea procesado, podés hacerlo aquí:\n${cancelUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
          <img src="http://localhost:3000/assets/logo.png" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
          <h2 style="text-align: center; color: #333;">¡Gracias por tu compra, ${guestName}!</h2>
          <p style="font-size: 16px; color: #555;">Recibimos tu pedido <strong>#${orderId}</strong>.</p>
          <p style="font-size: 16px; color: #555;">Productos:</p>
          <ul>
            ${order.products
        .map((p) => {
          const productName = p.product?.name ? capitalizeWords(p.product.name) : 'Producto desconocido';
          return `
                  <li style="font-size: 16px; color: #555;">
                    ${productName} - Talle: ${p.size} - Color: ${p.color} - Cantidad: ${p.quantity}
                  </li>
                `;
        })
        .join('')}
          </ul>
          <p style="font-size: 16px; color: #555;">Importe total: <strong>$${order.products.reduce((acc, p) => acc + p.price * p.quantity, 0)}</strong></p>
          <p style="font-size: 16px; color: #555;">Estado de envío: <strong>${status || 'Pendiente'}</strong></p>
          <p style="font-size: 16px; color: #555;">Dirección de entrega: <strong>${address}</strong></p>
          <hr />
          <p style="font-size: 14px; color: #999;">Adjuntamos el comprobante de pago en PDF. Te avisaremos cuando tu pedido esté en camino.</p>
          <hr />
          <div style="text-align: center; margin: 20px 0;">
            <a href="${viewOrderUrl}" style="background-color: #1976d2; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Ver pedido
            </a>
          </div>
          <p style="font-size: 16px; color: #555;">¿Querés cancelar tu pedido? Hacelo antes de que sea procesado:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${cancelUrl}" style="background-color: #e53935; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Cancelar pedido
            </a>
          </div>
        </div>
      </div>
    `
  };
};

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

export const updateStatusEmailTemplate = (name, orderId, newStatus) => ({
  subject: `Actualización de estado de tu pedido #${orderId}`,
  text: `¡Hola ${name}! Tu pedido #${orderId} ha cambiado de estado. Ahora está en estado: ${newStatus}.`,
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <img src="http://localhost:3000/assets/logo.png" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
        <h2 style="text-align: center; color: #333;">¡Hola ${name}!</h2>
        <p style="font-size: 16px; color: #555;">Te informamos que el estado de tu pedido <strong>#${orderId}</strong> ha sido actualizado.</p>
        <p style="font-size: 16px; color: #555;">Estado actual: <strong>${newStatus}</strong></p>
        <p style="font-size: 14px; color: #999;">Gracias por confiar en nosotros. ¡Te avisaremos si hay más actualizaciones en tu pedido!</p>
      </div>
    </div>
  `
});

export const adminNewOrderEmailTemplate = (order) => ({
  subject: `Nuevo pedido recibido: #${order._id}`,
  text: `Nuevo pedido recibido
        Cliente: ${order.guestName}
        Email: ${order.guestEmail}
        Teléfono: ${order.guestPhone}
        Dirección: ${order.guestAddress.street} ${order.guestAddress.number}, ${order.guestAddress.city}, ${order.guestAddress.province}, CP ${order.guestAddress.postalCode}`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f8f8;">
      <div style="max-width: 600px; background: #fff; padding: 30px; border-radius: 8px; margin: auto;">
        <h2>Nuevo pedido recibido</h2>
        <p><strong>ID de orden:</strong> ${order._id}</p>
        <p><strong>Cliente:</strong> ${order.guestName}</p>
        <p><strong>Email:</strong> ${order.guestEmail}</p>
        <p><strong>Teléfono:</strong> ${order.guestPhone}</p>
        <p><strong>Dirección:</strong> ${order.guestAddress.street} ${order.guestAddress.number}, ${order.guestAddress.city}, ${order.guestAddress.province}, CP ${order.guestAddress.postalCode}</p>
        <hr />
        <h4>Productos:</h4>
        <ul>
          ${order.products
      .map((item) => {
        const name = item.product?.name
          ? capitalizeWords(item.product.name)
          : 'Producto desconocido';
        const productId = item.product?._id || 'ID no disponible';
        return `
                <li style="margin-bottom: 10px;">
                  <strong>ID del producto:</strong> ${productId}<br/>
                  <strong>Nombre del producto:</strong> ${name}<br/>
                  <strong>Color:</strong> ${item.color} - <strong>Talle:</strong> ${item.size} - <strong>Cantidad:</strong> ${item.quantity}
                </li>`;
      })
      .join('')}
        </ul>
        <hr />
        <p><strong>Total:</strong> $${order.products.reduce(
        (acc, p) => acc + p.price * p.quantity,
        0
      )}</p>
      </div>
    </div>
  `,
});

// export const promoEmailTemplate = (subject, content) => `
//   <html>
//     <body style="font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 40px;">
//       <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
//         <img src="https://imgur.com/xPXwqNk" alt="GP Footwear Logo" style="width: 120px; display: block; margin: 0 auto 20px;" />
//         <h2 style="color: #2c3e50; text-align: center;">${subject}</h2>
//         <div style="padding: 20px; font-size: 16px; line-height: 1.6; color: #333;">
//           ${content}
//         </div>
//         <footer style="text-align: center; margin-top: 20px; font-size: 12px;">
//           <p style="color: #7f8c8d;">Gracias por ser parte de nuestra comunidad.</p>
//           <p style="color: #7f8c8d;">Si no deseas recibir más promociones, podés darte de baja.</p>
//         </footer>
//       </div>
//     </body>
//   </html>
// `;
