import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

export const generateInvoice = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const LINE_WIDTH = 32;
    const fullLine = (char = "*") => char.repeat(LINE_WIDTH);
    const doc = new PDFDocument({ size: [200, 350], margin: 10 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    const center = { align: "center" };
    const right = { align: "right" };
    const left = { align: "left" };
    doc.moveDown(2);
    doc.font("Courier").fontSize(9);
    doc.text(fullLine("*"), center);
    doc.text("GP FOOTWEAR", center);
    doc.text("Santa Fe, CP 3000", center);
    doc.text(fullLine("*"), center);
    doc.moveDown(0.5);
    const date = new Date(order.createdAt).toLocaleString("es-AR");
    doc.text(`Comprobante N° ${order._id.toString().slice(-6).toUpperCase()}`, center);
    doc.text(`Fecha: ${date}`, center);
    doc.moveDown(0.5);
    doc.text(fullLine("-"), center);
    const name = order.user
      ? `${order.user.name?.first || ""} ${order.user.name?.last || ""}`.trim()
      : order.guestName || "Cliente";
    doc.text(`Cliente: ${name}`, left);
    const address = order.shipping?.deliveryAddress || order.guestAddress || {};
    doc.text(`Dirección: ${address.street || ""} ${address.number || ""}`.trim(), left);
    if (address.city) doc.text(`Ciudad: ${address.city}`, left);
    if (address.province) doc.text(`Provincia: ${address.province}`, left);
    doc.moveDown(0.5);
    doc.text(fullLine("-"), center);
    let total = 0;
    order.products.forEach((item) => {
      const name = capitalizeWords(item.product.name);
      const qty = item.quantity;
      const price = item.price;
      const itemTotal = qty * price;
      total += itemTotal;
      doc.text(`${qty} x ${name}`, left);
      doc.text(`$${itemTotal.toFixed(2)}`, right);
    });
    doc.text(fullLine("-"), center);
    doc.font("Courier-Bold").text(`TOTAL: $${total.toFixed(2)}`, right);
    doc.font("Courier").text(fullLine("-"), center);
    doc.moveDown(1);
    doc.text("¡Gracias por su compra!", center);
    doc.text(fullLine("*"), center);
    doc.moveDown(1);
    const logoPath = path.resolve("assets", "logo.png");
    if (fs.existsSync(logoPath)) {
      const imageWidth = 50;
      const x = doc.page.width / 2 - imageWidth / 2;
      doc.image(logoPath, x, doc.y, { width: imageWidth });
    }
    doc.moveDown(2);
    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};
