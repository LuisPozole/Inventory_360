const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantityChange: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Venta', 'Reabastecimiento', 'Ajuste_IA'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
