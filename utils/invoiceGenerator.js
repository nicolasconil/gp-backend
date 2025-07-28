import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoice = (order, filePath) => {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Logo
        const logoPath = path.resolve('assets', 'logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 40, { width: 80 });
        }

        // Título
        doc.fontSize(18).font('Helvetica-Bold').text('Comprobante de compra', 50, 130);
        doc.fontSize(10).fillColor('#555').text(`Comprobante N° ${order._id.toString().slice(-6).toUpperCase()}`);
        doc.moveDown();

        // Cliente y empresa (bloques separados)
        doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text('Emitido a:');
        if (order.user) {
            const name = order.user.name ? `${order.user.name.first || ''} ${order.user.name.last || ''}`.trim() : 'Sin nombre';
            doc.font('Helvetica').fontSize(10).text(`${name}`);
            doc.text(`Email: ${order.user.email}`);
            if (order.user.phone?.number) doc.text(`Teléfono: ${order.user.phone.number}`);
        } else {
            const name = order.guestName || 'Sin nombre';
            const email = order.guestEmail || 'Sin email';
            const phone = order.guestPhone || '';
            doc.font('Helvetica').fontSize(10).text(`${name}`);
            doc.text(`Email: ${email}`);
            if (phone) doc.text(`Teléfono: ${phone}`);
        }

        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(12).text('Empresa:');
        doc.font('Helvetica').fontSize(10).text('GP Footwear');
        doc.text('Santa Fe, CP 3000');
        doc.moveDown();

        // Dirección
        doc.font('Helvetica-Bold').fontSize(12).text('Dirección de envío:');
        let addr = {};
        if (order.shipping?.deliveryAddress && Object.keys(order.shipping.deliveryAddress).length > 0) {
            addr = order.shipping.deliveryAddress;
        } else if (order.guestAddress) {
            addr = order.guestAddress;
        }
        doc.font('Helvetica').fontSize(10);
        doc.text(`Dirección: ${addr.street || ''} ${addr.number || ''}`);
        if (addr.apartment) doc.text(`Departamento: ${addr.apartment}`);
        doc.text(`Ciudad: ${addr.city || ''}`);
        doc.text(`Provincia: ${addr.province || ''}`);
        doc.text(`Código postal: ${addr.destinationPostalCode || addr.postalCode || ''}`);
        doc.moveDown(1);

        // Artículos
        doc.font('Helvetica-Bold').fontSize(12).text('Artículos');
        doc.moveDown(0.3);

        // Tabla
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Cant.', 50, doc.y, { width: 50 });
        doc.text('Descripción', 100, doc.y, { width: 300 });
        doc.text('Subtotal', 400, doc.y, { width: 100, align: 'right' });
        doc.moveDown(0.3);
        doc.font('Helvetica');

        let subtotal = 0;
        order.products.forEach((item) => {
            const itemTotal = item.quantity * item.price;
            subtotal += itemTotal;

            doc.text(`${item.quantity}`, 50, doc.y, { width: 50 });
            doc.text(`${item.product.name}`, 100, doc.y, { width: 300 });
            doc.text(`$${itemTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`, 400, doc.y, { width: 100, align: 'right' });
            doc.moveDown(0.2);
        });

        // Total
        const total = subtotal;

        doc.moveDown(1);
        doc.fontSize(10);
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Total: $${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`, 400, doc.y, { align: 'right' });

        doc.moveDown(1);
        doc.fontSize(9).font('Helvetica');

        doc.moveDown();
        doc.fontSize(9).text('Gracias por su compra.', { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};
