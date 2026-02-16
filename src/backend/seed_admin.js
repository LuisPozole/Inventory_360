const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Conectado');

        const email = 'admin@inventory360.com';
        const password = '123456';

        let user = await User.findOne({ email });

        if (user) {
            console.log('El usuario admin ya existe');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name: 'Admin User',
            email,
            password: hashedPassword,
            role: 'Admin'
        });

        await user.save();
        console.log('Usuario Admin creado exitosamente:');
        console.log('Email:', email);
        console.log('Password:', password);

        process.exit(0);
    } catch (err) {
        console.error('Error al crear usuario:', err);
        process.exit(1);
    }
};

createAdmin();
