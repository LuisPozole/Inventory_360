const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Get all products (with optional filters)
exports.getProducts = async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (status) {
            if (status === 'en_stock') {
                filter.$expr = { $gt: ['$stock', { $multiply: ['$criticalThreshold', 2] }] };
            } else if (status === 'stock_bajo') {
                filter.$and = [
                    { $expr: { $gt: ['$stock', '$criticalThreshold'] } },
                    { $expr: { $lte: ['$stock', { $multiply: ['$criticalThreshold', 2] }] } }
                ];
            } else if (status === 'stock_critico') {
                filter.$expr = { $lte: ['$stock', '$criticalThreshold'] };
            }
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort({ name: 1 });

        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// Get all categories (for filter dropdowns)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// Create a new category (Admin only)
exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ msg: 'El nombre de la categoría es obligatorio' });
    }
    try {
        const newCategory = new Category({ name: name.trim(), description });
        const category = await newCategory.save();
        res.json(category);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'La categoría ya existe' });
        }
        res.status(500).send('Error en el servidor');
    }
};

// Create a new product (Admin only)
exports.createProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { sku, name, description, category, price, stock, criticalThreshold, imageUrl } = req.body;

    try {
        const newProduct = new Product({
            sku,
            name,
            description,
            category,
            price,
            stock,
            criticalThreshold,
            imageUrl
        });

        const product = await newProduct.save();
        const populated = await product.populate('category', 'name');
        res.json(populated);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'El SKU ya existe' });
        }
        res.status(500).send('Error en el servidor');
    }
};

// Update a product (Admin only)
exports.updateProduct = async (req, res) => {
    const { sku, name, description, category, price, stock, criticalThreshold, imageUrl } = req.body;

    try {
        let product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });

        // Update fields
        if (sku !== undefined) product.sku = sku;
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;
        if (criticalThreshold !== undefined) product.criticalThreshold = criticalThreshold;
        if (imageUrl !== undefined) product.imageUrl = imageUrl;

        // Use save() so pre-save hook recalculates status
        await product.save();
        const populated = await product.populate('category', 'name');
        res.json(populated);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'El SKU ya existe' });
        }
        res.status(500).send('Error en el servidor');
    }
};

// Delete a product (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });

        await Product.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Producto eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};
