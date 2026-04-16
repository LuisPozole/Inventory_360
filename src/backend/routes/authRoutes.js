const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check } = require('express-validator');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'Por favor incluye un email válido').isEmail(),
        check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 })
    ],
    authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/create-user
// @desc    Create a new user (Admin only)
// @access  Private
router.post(
    '/create-user',
    authMiddleware,
    [
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'Por favor incluye un email válido').isEmail(),
        check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 })
    ],
    authController.createUserAdmin
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, authController.getMe);

// @route   POST api/auth/forgot-password
// @desc    Forgot Password - Send reset email
// @access  Public
router.post(
    '/forgot-password',
    [
        check('email', 'Por favor incluye un email válido').isEmail()
    ],
    authController.forgotPassword
);

// @route   POST api/auth/reset-password
// @desc    Reset Password
// @access  Public
router.post(
    '/reset-password',
    [
        check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 }),
        check('token', 'El token es obligatorio').not().isEmpty()
    ],
    authController.resetPassword
);

module.exports = router;
