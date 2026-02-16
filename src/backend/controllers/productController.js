const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ date: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
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
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// Update a product (Admin only)
exports.updateProduct = async (req, res) => {
    const { sku, name, description, category, price, stock, criticalThreshold, imageUrl } = req.body;

    // Build product object
    const productFields = {};
    if (sku) productFields.sku = sku;
    if (name) productFields.name = name;
    if (description) productFields.description = description;
    if (category) productFields.category = category;
    if (price) productFields.price = price;
    if (stock !== undefined) productFields.stock = stock;
    if (criticalThreshold) productFields.criticalThreshold = criticalThreshold;
    if (imageUrl) productFields.imageUrl = imageUrl;

    try {
        let product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: productFields },
            { new: true }
        );

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// Delete a product (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });

        await Product.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Producto eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};
