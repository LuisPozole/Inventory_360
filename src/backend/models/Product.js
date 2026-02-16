const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    criticalThreshold: {
        type: Number,
        default: 10
    },
    status: {
        type: String,
        enum: ['Normal', 'Critico'],
        default: 'Normal'
    },
    imageUrl: {
        type: String,
        trim: true
    }
});

// Middleware to update status based on stock and threshold
// Middleware to update status based on stock and threshold
// Using Mongoose modern syntax where next() is optional if we don't throw an error.
// However, to be safe and avoid issues, we will just return a resolved promise implicitly.
productSchema.pre('save', async function () {
    if (this.stock <= this.criticalThreshold) {
        this.status = 'Critico';
    } else {
        this.status = 'Normal';
    }
});

module.exports = mongoose.model('Product', productSchema);