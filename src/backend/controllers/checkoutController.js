const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

/**
 * POST /api/checkout
 * Body: { items: [{ productId: string, qty: number }] }
 * Creates StockTransaction records for each item and reduces product stock.
 * Returns the updated products so the frontend can sync state.
 */
exports.processCheckout = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: 'Se requiere al menos un artículo.' });
        }

        const updatedProducts = [];
        const transactions = [];

        for (const item of items) {
            const { productId, qty } = item;

            if (!productId || !qty || qty <= 0) {
                return res.status(400).json({
                    msg: `Artículo inválido: productId=${productId}, qty=${qty}`
                });
            }

            const product = await Product.findById(productId).populate('category');

            if (!product) {
                return res.status(404).json({
                    msg: `Producto no encontrado: ${productId}`
                });
            }

            if (product.stock < qty) {
                return res.status(400).json({
                    msg: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${qty}`
                });
            }

            // Reduce stock — pre-save middleware auto-updates status
            product.stock -= qty;
            await product.save();

            // Create stock transaction record
            const transaction = new StockTransaction({
                product: product._id,
                user: req.user.id,
                quantityChange: -qty,
                type: 'Venta'
            });
            await transaction.save();

            updatedProducts.push(product);
            transactions.push(transaction);
        }

        res.json({
            success: true,
            msg: `Solicitud de salida procesada: ${transactions.length} artículo(s).`,
            updatedProducts,
            transactionCount: transactions.length
        });
    } catch (err) {
        console.error('Error en checkout:', err.message);
        res.status(500).json({ msg: 'Error del servidor al procesar la solicitud.' });
    }
};
