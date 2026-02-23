const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMonitor = require('../middlewares/authMiddleware');
const { check } = require('express-validator');

// Middleware to check if user is admin
const adminCheck = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Acceso denegado: Se requiere rol de Admin' });
    }
    next();
};

// @route   GET api/products/categories
// @desc    Get all categories (for dropdowns)
// @access  Private
router.get('/categories', authMonitor, productController.getCategories);

// @route   POST api/products/categories
// @desc    Create a category
// @access  Private (Admin only)
router.post('/categories', [authMonitor, adminCheck], productController.createCategory);

// @route   GET api/products
// @desc    Get all products (supports ?search=&category=&status= filters)
// @access  Private
router.get('/', authMonitor, productController.getProducts);

// @route   POST api/products
// @desc    Create a product
// @access  Private (Admin only)
router.post(
    '/',
    [
        authMonitor,
        adminCheck,
        [
            check('sku', 'SKU es obligatorio').not().isEmpty(),
            check('name', 'Nombre es obligatorio').not().isEmpty(),
            check('category', 'Categoría es obligatoria').not().isEmpty(),
            check('price', 'Precio es obligatorio').isNumeric(),
            check('stock', 'Stock es obligatorio').isNumeric()
        ]
    ],
    productController.createProduct
);

// @route   PUT api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', [authMonitor, adminCheck], productController.updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', [authMonitor, adminCheck], productController.deleteProduct);

module.exports = router;
