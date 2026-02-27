const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const StockTransaction = require('./models/StockTransaction');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const seedTransactions = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Conectado');

        // Fetch at least one user and some products
        const user = await User.findOne({});
        if (!user) {
            console.error('No se encontro ningun usuario. Por favor crea uno primero.');
            process.exit(1);
        }

        const products = await Product.find({});
        if (!products.length) {
            console.error('No se encontraron productos. Crea al menos un producto primero.');
            process.exit(1);
        }

        const transTypes = ['Venta', 'Reabastecimiento', 'Ajuste_IA'];
        const transactionsToInsert = [];

        // Distribute transactions over the last 90 days
        const now = new Date();

        for (let i = 0; i < 100; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomType = transTypes[Math.floor(Math.random() * transTypes.length)];

            // Random days ago between 0 and 90
            const randomDaysAgo = Math.floor(Math.random() * 90);
            const pastDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));

            // For Venta, quantity is usually negative or positive but typically sales reduce stock.
            // Depending on how the system implements it, we'll assign realistic numbers
            let quantityChange;
            if (randomType === 'Venta') {
                quantityChange = -Math.floor(Math.random() * 10) - 1; // -1 to -10
            } else if (randomType === 'Reabastecimiento') {
                quantityChange = Math.floor(Math.random() * 50) + 10; // 10 to 59
            } else {
                quantityChange = Math.floor(Math.random() * 5) - 2; // -2 to 2 for AI adjustment
                if (quantityChange === 0) quantityChange = 1;
            }

            transactionsToInsert.push({
                product: randomProduct._id,
                user: user._id,
                quantityChange,
                type: randomType,
                date: pastDate
            });
        }

        // Sort by date so it looks chronological if needed, though insertMany doesn't strictly require it
        transactionsToInsert.sort((a, b) => a.date - b.date);

        await StockTransaction.insertMany(transactionsToInsert);
        console.log('100 registros historicos (StockTransactions) creados exitosamente.');

        process.exit(0);
    } catch (err) {
        console.error('Error al insertar transacciones:', err);
        process.exit(1);
    }
};

seedTransactions();
