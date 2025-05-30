import PDFDocument from "pdfkit";

export const generatePDFBuffer = (user) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            const fullName = `${user.name?.first || ''} ${user.name?.last || ''}`.trim();
            const phone = user.phone?.number || 'No disponible.';
            const address = user.address?.street || 'No disponible.';
            doc.fontSize(18).text(`Datos del usuario`, { underline: true }).moveDown();
            doc.fontSize(12).text(`Nombre: ${fullName || 'No disponible'}.`);
            doc.text(`Correo: ${user.email || 'No disponible'}.`);
            doc.text(`Teléfono: ${phone}`);
            doc.text(`Dirección: ${address}`);
            doc.end();
        } catch (error) {
            reject(new Error('Error generando el PDF: ' + error.message));
        }
    });
};

export const generateCSV = (user) => {
    const fullName = `${user.name?.first || ''} ${user.name?.last || ''}`.trim();
    const phone = user.phone?.number || 'No disponible.';
    const address = user.address?.street || 'No disponible.';
    const csvData = [
        ['Campo', 'Valor'],
        ['Nombre', fullName],
        ['Correo', user.email || ''],
        ['Teléfono', phone],
        ['Dirección', address]
    ];
    return csvData.map(row => row.join(',')).join('\n');
};

export const generateJSON = (user) => {
    const fullName = `${user.name?.first || ''} ${user.name?.last || ''}`.trim();
    const phone = user.phone?.number || 'No disponible.';
    const address = user.address?.street || 'No disponible.';
    return JSON.stringify({
        name: fullName,
        email: user.email || '',
        phone: phone,
        address: address
    }, null, 2);
};