const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Sales (Count of 'Venta' transactions * quantity is not enough, usually Sum of Price * Quantity)
        // For MVP, if we don't store price in transaction, we can just sum quantity or look up price.
        // Simplifying: Sum of quantity sold. 
        // Wait, the prompt says "Ventas" as a KPI. Let's assume Total Items Sold or Total Revenue if possible.
        // Given the models, Transaction has QuantityChange.

        // Total Stock (Sum of all product stocks)
        const stockAggregation = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" },
                    activeProducts: { $sum: 1 } // Count of all products
                }
            }
        ]);

        // Total Products Active (Simple count, already got it)

        // Sales Logic: 
        // Sum of quantityChange where type = 'Venta' (usually negative change? or positive quantity in transaction?)
        // 'Cant_Cambio' suggests signed or absolute. Usually Sales reduce stock, so change is negative. 
        // But logically we store "Sales Amount" or "Quantity Sold". Let's assume Transaction stores the *amount changed*.
        // If we assume Venta means reducing stock, the transaction quantity might be stored as negative or positive depending on implementation.
        // Let's assume we store absolute quantity in 'quantityChange' and 'type' defines the direction in the logic.

        // We haven't implemented the logic that *creates* transactions yet.
        // But for the stats:
        const salesAggregation = await StockTransaction.aggregate([
            { $match: { type: 'Venta' } },
            {
                $group: {
                    _id: null,
                    totalItemsSold: { $sum: "$quantityChange" }
                }
            }
        ]);

        const stats = {
            totalStock: stockAggregation[0]?.totalStock || 0,
            activeProducts: stockAggregation[0]?.activeProducts || 0,
            totalSales: salesAggregation[0]?.totalItemsSold || 0
        };

        res.json(stats);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};
