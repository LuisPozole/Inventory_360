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

/**
 * Sends a password reset email to a user
 * @param {String} email - User email
 * @param {String} token - Reset token
 * @param {String} userName - User name
 */
const sendPasswordResetEmail = async (email, token, userName) => {
    try {
        await initTransporter();

        if (!transporter) {
            console.error('❌ El servicio de correo no está inicializado.');
            return;
        }

        // Generate the reset link (using the CORS_ORIGIN or frontend URL)
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
        const resetLink = `${frontendUrl}?token=${token}`;

        const mailOptions = {
            from: '"Inventory 360 Security" <no-reply@inventory360.com>',
            to: email,
            subject: 'Recuperación de Contraseña - Inventory 360',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0;">Inventory 360</h1>
                        <p style="color: #7f8c8d; font-size: 16px;">Sistema de Gestión de Inventarios</p>
                    </div>
                    
                    <div style="color: #333; line-height: 1.6;">
                        <p>Hola <strong>${userName}</strong>,</p>
                        <p>Has solicitado restablecer tu contraseña para tu cuenta en <strong>Inventory 360</strong>.</p>
                        <p>Para completar el proceso, haz clic en el siguiente botón. Este enlace es válido por <strong>1 hora</strong>.</p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${resetLink}" style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                Restablecer Contraseña
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                        <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${resetLink}</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                        
                        <p style="font-size: 13px; color: #999;">Si no has solicitado este cambio, por favor ignora este correo. Tu contraseña seguirá siendo la misma.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #bdc3c7; font-size: 12px;">
                        <p>&copy; 2026 Inventory 360. Todos los derechos reservados.</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de recuperación enviado exitosamente a ${email}.`);

        const testUrl = nodemailer.getTestMessageUrl(info);
        if (testUrl) {
            console.log('========================================================');
            console.log('📧 PREVISUALIZA EL CORREO DE RECUPERACIÓN AQUÍ:');
            console.log(`👉 ${testUrl}`);
            console.log('========================================================');
        }

    } catch (error) {
        console.error('❌ Error al enviar el correo de recuperación:', error);
    }
};

module.exports = {
    sendStockAlertEmail,
    sendPasswordResetEmail
};
