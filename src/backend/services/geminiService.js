const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require('../models/Product');
const Category = require('../models/Category'); // <-- ASEGÚRATE DE QUE ESTA RUTA SEA CORRECTA

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Función auxiliar para generar SKU automático
function generateSKU(productName) {
    const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
    return `${prefix}-${randomNumbers}`;
}

async function processCommand(commandText) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Eres un asistente de Inteligencia Artificial para un sistema de gestión de inventario.
      Tu tarea es interpretar el comando en lenguaje natural del usuario y extraer la intención y los parámetros.
      DEBES responder y formular tus mensajes SIEMPRE en Español.
      
      Las acciones disponibles son:
      1. ADD_PRODUCT: Añadir o crear un nuevo producto en el inventario.
      2. UPDATE_STOCK: Actualizar la cantidad de stock de un producto existente.
      3. CHECK_STOCK: Consultar el nivel de stock actual de un producto.
      4. UNKNOWN: Si el comando no se entiende o no tiene relación.

      Devuelve ÚNICAMENTE un objeto JSON VÁLIDO con esta estructura exacta:
      {
        "action": "ADD_PRODUCT" | "UPDATE_STOCK" | "CHECK_STOCK" | "UNKNOWN",
        "productName": "string (nombre del producto extraído) o null",
        "quantity": number (cantidad) o null,
        "price": number (precio del producto si se menciona) o null,
        "category": "string (nombre de la categoría si se menciona) o null",
        "message": "Mensaje amigable confirmando o explicando qué falta (en Español)"
      }

      Comando del Usuario: "${commandText}"
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedResult;
        try {
            parsedResult = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return { action: 'UNKNOWN', message: "Lo siento, no pude entender tu solicitud. ¿Podrías reformularla?" };
        }

        // --- LÓGICA: AÑADIR PRODUCTO ---
        if (parsedResult.action === 'ADD_PRODUCT') {
            // Ya no pedimos el SKU a Gemini
            if (!parsedResult.productName || !parsedResult.price || !parsedResult.category) {
                return {
                    message: "Para añadir un producto nuevo a la base de datos necesito más detalles. Por favor indícame: Nombre, Cantidad, Precio y Categoría (Ej: 'Añade 10 refrescos, precio 15, categoría bebidas')."
                };
            }

            const existingProduct = await Product.findOne({
                name: { $regex: new RegExp(`^${parsedResult.productName}$`, 'i') }
            });

            if (existingProduct) {
                return { message: `El producto "${existingProduct.name}" ya existe en el inventario.` };
            }

            // --- LÓGICA DE CATEGORÍA (Manejo de ObjectId) ---
            // Buscamos si la categoría ya existe en la base de datos
            let categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${parsedResult.category}$`, 'i') }
            });

            // Si la categoría no existe, la creamos al vuelo
            if (!categoryDoc) {
                categoryDoc = new Category({ name: parsedResult.category.toLowerCase() });
                await categoryDoc.save();
            }

            // --- CREACIÓN DEL PRODUCTO ---
            const initialStock = parsedResult.quantity !== null ? parsedResult.quantity : 0;
            const newProduct = new Product({
                name: parsedResult.productName,
                stock: initialStock,
                price: parsedResult.price,
                sku: generateSKU(parsedResult.productName), // Generamos el SKU aquí
                category: categoryDoc._id // Asignamos el ObjectId correcto
            });

            await newProduct.save();

            return {
                action: 'ADD_PRODUCT',
                product: newProduct.name,
                message: `El producto "${newProduct.name}" (SKU: ${newProduct.sku}) ha sido añadido con éxito en la categoría "${categoryDoc.name}".`
            };

            // --- LÓGICA: ACTUALIZAR STOCK ---
        } else if (parsedResult.action === 'UPDATE_STOCK') {
            if (!parsedResult.productName || parsedResult.quantity === null) {
                return { message: "Necesito el nombre del producto y la cantidad para actualizar el stock." };
            }

            const product = await Product.findOne({
                name: { $regex: parsedResult.productName, $options: 'i' }
            });

            if (!product) {
                return { message: `No encontré ningún producto llamado "${parsedResult.productName}".` };
            }

            const oldStock = product.stock;
            product.stock = parsedResult.quantity;
            await product.save();

            return {
                action: 'UPDATE_STOCK',
                message: `Stock de ${product.name} actualizado. Antes: ${oldStock}, Ahora: ${product.stock}.`
            };

            // --- LÓGICA: CONSULTAR STOCK ---
        } else if (parsedResult.action === 'CHECK_STOCK') {
            if (!parsedResult.productName) {
                return { message: "Necesito el nombre del producto para consultar el stock." };
            }

            const product = await Product.findOne({
                name: { $regex: parsedResult.productName, $options: 'i' }
            });

            if (!product) {
                return { message: `No encontré ningún producto llamado "${parsedResult.productName}".` };
            }

            return {
                action: 'CHECK_STOCK',
                message: `El stock actual de ${product.name} es de ${product.stock} unidades.`
            };
        }

        return { message: parsedResult.message || "No estoy seguro de qué hacer con esa orden." };

    } catch (error) {
        console.error("Gemini Service Error:", error);
        throw new Error("Hubo un error al procesar tu solicitud con la IA.");
    }
}

module.exports = {
    processCommand
};