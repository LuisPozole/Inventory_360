const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile_${req.user.id}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk && mimeOk);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/profile — Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

// PUT /api/profile — Update profile (name, email, phone)
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const updateFields = {};

        if (name !== undefined) updateFields.name = name.trim();
        if (email !== undefined) updateFields.email = email.trim().toLowerCase();
        if (phone !== undefined) updateFields.phone = phone.trim();

        // Check if email is already taken by another user
        if (updateFields.email) {
            const existing = await User.findOne({ email: updateFields.email, _id: { $ne: req.user.id } });
            if (existing) {
                return res.status(400).json({ msg: 'Ese email ya está registrado por otro usuario' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

// POST /api/profile/image — Upload profile image
exports.uploadImage = upload.single('profileImage');

exports.saveImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No se recibió ninguna imagen válida' });
        }

        // Delete old profile image if exists
        const currentUser = await User.findById(req.user.id);
        if (currentUser.profileImage) {
            const oldPath = path.join(__dirname, '..', currentUser.profileImage);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const imagePath = `/uploads/profiles/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profileImage: imagePath } },
            { new: true }
        ).select('-password');

        res.json({ profileImage: user.profileImage, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error al subir la imagen' });
    }
};
