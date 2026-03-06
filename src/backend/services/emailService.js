const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

let transporter = null;

/**
 * Initializes the Nodemailer transporter.
 * If true SMTP credentials exist in process.env, uses those.
 * Otherwise, generates an Ethereal test account automatically and logs the config to terminal.
 */
const initTransporter = async () => {
    if (transporter) return;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use real credentials
        console.log('🔄 Inicializando servicio de correo con credenciales reales...');
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Use fake credentials for testing (Ethereal)
        console.log('🔄 No se encontraron credenciales reales en .env.');
        console.log('⏳ Creando cuenta de correo falsa (Ethereal) para pruebas...');
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            console.log('✅ Cuenta de prueba Ethereal creada exitosamente.');
            console.log(`✉️ Los correos falsos se pueden previsualizar en la URL que se imprimirá al enviarlos.`);
        } catch (err) {
            console.error('❌ Error creando la cuenta de prueba en Ethereal:', err);
        }
    }
};

/**
 * Sends a stock alert email to the provided admin emails
 * @param {Object} product - The product object that is in critical status
 * @param {Array<String>} adminEmails - List of administrator emails
 */
const sendStockAlertEmail = async (product, adminEmails) => {
    try {
        await initTransporter();

        if (!transporter) {
            console.error('❌ El servicio de correo no está inicializado.');
            return;
        }

        if (!adminEmails || adminEmails.length === 0) {
            console.log('⚠️ No hay administradores registrados para recibir la alerta de stock.');
            return;
        }

        const mailOptions = {
            from: '"Inventory 360 System" <no-reply@inventory360.com>',
            to: adminEmails.join(', '), // list of receivers
            subject: `🚨 Alerta de Inventario Crítico: ${product.name}`,
            text: `ATENCIÓN: El producto ${product.name} (SKU: ${product.sku}) ha alcanzado su nivel crítico de inventario.\n\nStock actual: ${product.stock}\nUmbral Crítico: ${product.criticalThreshold}\n\nPor favor reabastezca el inventario lo antes posible.`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #d9534f;">🚨 Alerta de Inventario Crítico</h2>
                    <p>Hola Administrador,</p>
                    <p>El producto <strong>${product.name}</strong> ha caído por debajo o igualado su límite crítico en el inventario.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d9534f; margin-bottom: 20px;">
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Producto:</strong> ${product.name}</li>
                            <li><strong>SKU:</strong> ${product.sku}</li>
                            <li><strong>Stock Actual:</strong> <span style="color: #d9534f; font-weight: bold;">${product.stock}</span> unidades</li>
                            <li><strong>Umbral Crítico:</strong> ${product.criticalThreshold} unidades</li>
                        </ul>
                    </div>
                    <p>Por favor, tome las acciones necesarias para reabastecer este producto a la brevedad.</p>
                    <br/>
                    <p>Saludos,<br/><strong>Equipo de Inventory 360</strong></p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Alerta de stock enviada exitosamente a los administradores (${adminEmails.length}).`);

        // If it's from ethereal email, we print the URL so the user can click it in the terminal
        const testUrl = nodemailer.getTestMessageUrl(info);
        if (testUrl) {
            console.log('========================================================');
            console.log('📧 PREVISUALIZAR CORREO FALSO AQUÍ (Haz CTRL+Click):');
            console.log(`👉 ${testUrl}`);
            console.log('========================================================');
        }

    } catch (error) {
        console.error('❌ Error al enviar el correo de alerta de stock:', error);
    }
};

module.exports = {
    sendStockAlertEmail
};
