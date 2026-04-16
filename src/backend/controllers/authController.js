const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'Vendedor'
        });

        await user.save();

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// Create new user (Admin only)
exports.createUserAdmin = async (req, res) => {
    try {
        // Double check admin role
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de Administrador.' });
        }

        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'Vendedor'
        });

        await user.save();

        res.json({ msg: 'Usuario creado exitosamente', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// Get current user (optional, for frontend session persistence)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

// @desc    Forgot Password - Send Reset Email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // We return 200 even if user not found for security reasons
            return res.json({ msg: 'Si el correo está registrado, recibirás un enlace de recuperación pronto.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Set token and expiry (1 hour)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        // Send Email
        await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);

        res.json({ msg: 'Si el correo está registrado, recibirás un enlace de recuperación pronto.' });
    } catch (err) {
        console.error('Error en forgotPassword:', err.message);
        res.status(500).send('Error en el servidor');
    }
};

// @desc    Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'El token de recuperación es inválido o ha expirado.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ msg: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
    } catch (err) {
        console.error('Error en resetPassword:', err.message);
        res.status(500).send('Error en el servidor');
    }
};
