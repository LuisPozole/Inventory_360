const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174', // Vite default alternative port
        process.env.CORS_ORIGIN
    ].filter(Boolean)
}));
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI); // Simplified without deprecated options
        console.log('MongoDB Conectado');
    } catch (err) {
        console.error('Error conectando a MongoDB:', err.message);
        process.exit(1);
    }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Default Route
app.get('/', (req, res) => {
    res.send('API de Inventory 360 funcionando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
