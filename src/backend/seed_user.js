const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Conectado para Seed de Usuario Normal');

        const existingUser = await User.findOne({ email: 'vendedor@inventory360.com' });

        if (existingUser) {
            console.log('El usuario vendedor ya existe.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt);

        const newUser = new User({
            name: 'Usuario Normal',
            email: 'vendedor@inventory360.com',
            password: password,
            role: 'Vendedor'  // Este es el rango asignado a usuario normal
        });

        await newUser.save();

        console.log('Usuario normal creado con éxito (vendedor@inventory360.com / 123456)');
        process.exit(0);

    } catch (err) {
        console.error('Error al poblar usuario normal:', err);
        process.exit(1);
    }
};

seedUser();
