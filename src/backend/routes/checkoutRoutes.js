const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkoutController = require('../controllers/checkoutController');

// @route   POST api/checkout
// @desc    Process a checkout (stock exit request) for the Vendedor
// @access  Private (any authenticated user)
router.post('/', authMiddleware, checkoutController.processCheckout);

module.exports = router;
