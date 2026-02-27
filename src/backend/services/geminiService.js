const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require('../models/Product');
const Category = require('../models/Category');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Función auxiliar para generar SKU automático
function generateSKU(productName) {
    const words = productName.trim().split(/\s+/).filter(Boolean).slice(0, 3);
    const prefix = words.map(w => w.substring(0, 3).toUpperCase()).join('-');
    const suffix = String(Math.floor(100 + Math.random() * 900));
    return `${prefix}-${suffix}`;
}

// Format a product for display in chat
function formatProduct(p) {
    const status = p.stock <= (p.criticalThreshold || 10)
        ? '🔴 Crítico'
        : p.stock <= (p.criticalThreshold || 10) * 2
            ? '🟡 Bajo'
            : '🟢 Normal';
    const catName = p.category?.name || 'Sin categoría';
    return `• **${p.name}** (SKU: ${p.sku}) — $${p.price} | Stock: ${p.stock} uds. ${status} | Cat: ${catName}`;
}

async function processCommand(commandText, history = []) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build conversation context from history
        const historyText = history.length > 0
            ? '\nHistorial reciente de la conversación:\n' +
            history.map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n') +
            '\n'
            : '';

        // ── Step 1: Classify intent ──
        const classifyPrompt = `
Eres un asistente de IA para un sistema de gestión de inventario llamado "Inventory 360".
Tu tarea es interpretar el mensaje del usuario y extraer la intención y los parámetros.
DEBES responder SIEMPRE en Español.

Las acciones disponibles son:
1. ADD_PRODUCT: Añadir o crear un nuevo producto. Necesitas: nombre, precio, categoría. Opcionalmente cantidad.
2. UPDATE_PRODUCT: Modificar datos de un producto existente (precio, nombre, categoría, umbral crítico).
3. DELETE_PRODUCT: Eliminar un producto del inventario.
4. UPDATE_STOCK: Actualizar la cantidad de stock (sumar, restar o establecer un valor).
5. CHECK_STOCK: Consultar el stock de un producto específico.
6. LIST_PRODUCTS: Listar productos, opcionalmente filtrados por categoría o estado.
7. GENERAL_CHAT: Cualquier otra pregunta o conversación que NO sea una operación de inventario (saludos, preguntas generales, dudas, etc.).

Devuelve ÚNICAMENTE un objeto JSON VÁLIDO con esta estructura:
{
  "action": "ADD_PRODUCT" | "UPDATE_PRODUCT" | "DELETE_PRODUCT" | "UPDATE_STOCK" | "CHECK_STOCK" | "LIST_PRODUCTS" | "GENERAL_CHAT",
  "productName": "nombre del producto o null",
  "quantity": number o null,
  "price": number o null,
  "category": "nombre de categoría o null",
  "newName": "nuevo nombre si se está renombrando, o null",
  "newPrice": number o null (para UPDATE_PRODUCT),
  "filterCategory": "categoría para filtrar al listar, o null",
  "message": "Mensaje amigable confirmando la acción o explicando qué falta (en Español)"
Usa el historial de conversación para entender el contexto. Si el usuario dice "ese", "el mismo", "cambia su precio", etc., infiere a qué producto se refiere del historial.
${historyText}
Mensaje del Usuario: "${commandText}"
`;

        const result = await model.generateContent(classifyPrompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return { action: 'UNKNOWN', message: "Lo siento, no pude entender tu solicitud. ¿Podrías reformularla?" };
        }

        // ── Step 2: Execute action ──

        // ═══ GENERAL CHAT ═══
        if (parsed.action === 'GENERAL_CHAT') {
            const chatPrompt = `
Eres un asistente virtual amigable llamado "INV 360 Assistant" para una empresa.
Responde la siguiente pregunta o mensaje de manera útil, amigable y concisa. Siempre en Español.
Si la pregunta es un saludo, responde de forma cálida y ofrece tu ayuda.
Puedes ayudar con preguntas generales, definiciones, cálculos, y cualquier otro tema.
${historyText}
Mensaje: "${commandText}"
`;
            const chatResult = await model.generateContent(chatPrompt);
            const chatResponse = await chatResult.response;
            return {
                action: 'GENERAL_CHAT',
                message: chatResponse.text()
            };
        }

        // ═══ ADD PRODUCT ═══
        if (parsed.action === 'ADD_PRODUCT') {
            if (!parsed.productName || !parsed.price || !parsed.category) {
                return {
                    action: 'ADD_PRODUCT',
                    message: "Para añadir un producto necesito: **Nombre**, **Precio** y **Categoría**.\nEjemplo: 'Añade 10 refrescos, precio $15, categoría bebidas'."
                };
            }

            const existing = await Product.findOne({
                name: { $regex: new RegExp(`^${parsed.productName}$`, 'i') }
            });
            if (existing) {
                return { action: 'ADD_PRODUCT', message: `El producto **"${existing.name}"** ya existe en el inventario (SKU: ${existing.sku}).` };
            }

            // Find or create category
            let categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${parsed.category}$`, 'i') }
            });
            if (!categoryDoc) {
                categoryDoc = new Category({ name: parsed.category.charAt(0).toUpperCase() + parsed.category.slice(1).toLowerCase() });
                await categoryDoc.save();
            }

            const newProduct = new Product({
                name: parsed.productName,
                stock: parsed.quantity ?? 0,
                price: parsed.price,
                sku: generateSKU(parsed.productName),
                category: categoryDoc._id
            });
            await newProduct.save();

            return {
                action: 'ADD_PRODUCT',
                message: `✅ Producto añadido exitosamente:\n• **${newProduct.name}** (SKU: ${newProduct.sku})\n• Precio: $${newProduct.price}\n• Stock: ${newProduct.stock} uds.\n• Categoría: ${categoryDoc.name}`
            };
        }

        // ═══ UPDATE PRODUCT ═══
        if (parsed.action === 'UPDATE_PRODUCT') {
            if (!parsed.productName) {
                return { action: 'UPDATE_PRODUCT', message: "Necesito el **nombre del producto** que deseas modificar." };
            }

            const product = await Product.findOne({
                name: { $regex: new RegExp(parsed.productName, 'i') }
            });

            if (!product) {
                return { action: 'UPDATE_PRODUCT', message: `No encontré ningún producto llamado **"${parsed.productName}"**.` };
            }

            const changes = [];

            if (parsed.newName) {
                product.name = parsed.newName;
                changes.push(`Nombre → ${parsed.newName}`);
            }
            if (parsed.newPrice !== null && parsed.newPrice !== undefined) {
                product.price = parsed.newPrice;
                changes.push(`Precio → $${parsed.newPrice}`);
            } else if (parsed.price !== null && parsed.price !== undefined) {
                product.price = parsed.price;
                changes.push(`Precio → $${parsed.price}`);
            }
            if (parsed.category) {
                let catDoc = await Category.findOne({
                    name: { $regex: new RegExp(`^${parsed.category}$`, 'i') }
                });
                if (!catDoc) {
                    catDoc = new Category({ name: parsed.category.charAt(0).toUpperCase() + parsed.category.slice(1).toLowerCase() });
                    await catDoc.save();
                }
                product.category = catDoc._id;
                changes.push(`Categoría → ${catDoc.name}`);
            }

            if (changes.length === 0) {
                return { action: 'UPDATE_PRODUCT', message: "No detecté qué campo deseas modificar. Puedes cambiar: **nombre**, **precio** o **categoría**." };
            }

            await product.save();
            return {
                action: 'UPDATE_PRODUCT',
                message: `✅ Producto **"${product.name}"** actualizado:\n${changes.map(c => `• ${c}`).join('\n')}`
            };
        }

        // ═══ DELETE PRODUCT ═══
        if (parsed.action === 'DELETE_PRODUCT') {
            if (!parsed.productName) {
                return { action: 'DELETE_PRODUCT', message: "Necesito el **nombre del producto** que deseas eliminar." };
            }

            const product = await Product.findOne({
                name: { $regex: new RegExp(parsed.productName, 'i') }
            });

            if (!product) {
                return { action: 'DELETE_PRODUCT', message: `No encontré ningún producto llamado **"${parsed.productName}"**.` };
            }

            const deletedName = product.name;
            const deletedSku = product.sku;
            await Product.findByIdAndDelete(product._id);

            return {
                action: 'DELETE_PRODUCT',
                message: `🗑️ Producto eliminado:\n• **${deletedName}** (SKU: ${deletedSku}) ha sido eliminado del inventario.`
            };
        }

        // ═══ UPDATE STOCK ═══
        if (parsed.action === 'UPDATE_STOCK') {
            if (!parsed.productName || parsed.quantity === null || parsed.quantity === undefined) {
                return { action: 'UPDATE_STOCK', message: "Necesito el **nombre del producto** y la **cantidad** para actualizar el stock." };
            }

            const product = await Product.findOne({
                name: { $regex: new RegExp(parsed.productName, 'i') }
            });

            if (!product) {
                return { action: 'UPDATE_STOCK', message: `No encontré ningún producto llamado **"${parsed.productName}"**.` };
            }

            const oldStock = product.stock;
            product.stock = parsed.quantity;
            await product.save();

            return {
                action: 'UPDATE_STOCK',
                message: `📦 Stock actualizado de **${product.name}**:\n• Antes: ${oldStock} uds.\n• Ahora: ${product.stock} uds.`
            };
        }

        // ═══ CHECK STOCK ═══
        if (parsed.action === 'CHECK_STOCK') {
            if (!parsed.productName) {
                return { action: 'CHECK_STOCK', message: "Necesito el **nombre del producto** para consultar el stock." };
            }

            const product = await Product.findOne({
                name: { $regex: new RegExp(parsed.productName, 'i') }
            }).populate('category', 'name');

            if (!product) {
                return { action: 'CHECK_STOCK', message: `No encontré ningún producto llamado **"${parsed.productName}"**.` };
            }

            const status = product.stock <= (product.criticalThreshold || 10)
                ? '🔴 Stock Crítico'
                : product.stock <= (product.criticalThreshold || 10) * 2
                    ? '🟡 Stock Bajo'
                    : '🟢 En Stock';

            return {
                action: 'CHECK_STOCK',
                message: `📊 Información de **${product.name}** (SKU: ${product.sku}):\n• Stock: ${product.stock} uds. — ${status}\n• Precio: $${product.price}\n• Categoría: ${product.category?.name || 'Sin categoría'}\n• Umbral crítico: ${product.criticalThreshold || 10} uds.`
            };
        }

        // ═══ LIST PRODUCTS ═══
        if (parsed.action === 'LIST_PRODUCTS') {
            let filter = {};

            if (parsed.filterCategory || parsed.category) {
                const catName = parsed.filterCategory || parsed.category;
                const catDoc = await Category.findOne({
                    name: { $regex: new RegExp(catName, 'i') }
                });
                if (catDoc) {
                    filter.category = catDoc._id;
                } else {
                    return { action: 'LIST_PRODUCTS', message: `No encontré la categoría **"${catName}"**. Intenta con otra.` };
                }
            }

            const products = await Product.find(filter)
                .populate('category', 'name')
                .sort({ name: 1 })
                .limit(15);

            if (products.length === 0) {
                return { action: 'LIST_PRODUCTS', message: "No se encontraron productos con esos criterios." };
            }

            const list = products.map(formatProduct).join('\n');
            const total = await Product.countDocuments(filter);
            const header = total > 15
                ? `📋 Mostrando **15 de ${total}** productos:`
                : `📋 **${total}** producto(s) encontrado(s):`;

            return {
                action: 'LIST_PRODUCTS',
                message: `${header}\n\n${list}`
            };
        }

        // Fallback
        return { action: 'UNKNOWN', message: parsed.message || "No estoy seguro de qué hacer con esa orden. ¿Podrías reformularla?" };

    } catch (error) {
        console.error("Gemini Service Error:", error);
        throw new Error("Hubo un error al procesar tu solicitud con la IA.");
    }
}

// ── Función para generar reporte estratégico del Dashboard ──
async function generateStrategyReport(contextData) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const reportPrompt = `
Eres un Analista de Negocios Experto y Consultor Estratégico de Retail para el sistema "Inventory 360".
El usuario (Administrador) ha solicitado un Diagnóstico Ejecutivo de su inventario.
A continuación te proveo los datos calculados de las últimas semanas:

Datos Estadísticos Globales:
- Ventas Totales (Hoy): $${contextData.stats.salesToday}
- Total en Stock (Unidades): ${contextData.stats.totalStock}
- Rotación Promedio: ${contextData.stats.avgRotation} días

Alertas Críticas (Productos que requieren atención inmediata o próxima):
${JSON.stringify(contextData.alerts.alerts.map(a => a.name + ' (Cat: ' + a.category + ') - Stock: ' + a.stock + ' - Estado: ' + a.severity), null, 2)}

Tendencia de Categorías (Próximos 30 días en base a historial reciente):
${JSON.stringify(contextData.categoryDemand, null, 2)}

Tu objetivo es generar un Reporte Ejecutivo profesional de 3 a 4 párrafos en texto estructurado y directo para imprimir en un documento PDF. NO uses formato Markdown complejo como tablas ni negritas excesivas, usa viñetas simples o números.
Debes estructurarlo en:
1. Resumen de la Situación Actual: (Un párrafo evaluando la rotación, el total vendido y la salud general).
2. Puntos Críticos a Resolver: (Menciona problemas de stock bajo basándote en las alertas provistas).
3. Recomendaciones Estratégicas y Predicción: (¿Qué categorías se deben impulsar? ¿Qué se predice a futuro o qué táctica de recompras sugieres basándote en la tendencia de las categorías?).

Responde de manera profesional, asertiva y ejecutiva en Español, directo al administrador y con recomendaciones accionables reales de inventario.
`;
        const result = await model.generateContent(reportPrompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Error al generar reporte de estrategia con Gemini:", error);
        throw new Error("No se pudo generar el reporte con IA en este momento.");
    }
}

module.exports = {
    processCommand,
    generateStrategyReport
};