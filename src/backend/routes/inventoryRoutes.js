const express = require('express');
const router = express.Router();
const { verifySession, authorizeRole } = require('../middlewares/authMiddleware');

// Apply protection to all inventory routes or specific ones
// "Protege la ruta global /inventory con verifySession"
// Assuming this router is mounted at /inventory, or we wrap routes here.
// The prompt says "Protege la ruta global /inventory". I'll assume this file handles /inventory routes,
// so I'll apply the middleware to the router or specific paths.

// Option A: Apply to all routes in this file
router.use(verifySession);

// GET / - Inventory Dashboard (Protected by verifySession)
router.get('/', (req, res) => {
    res.json({ message: 'Bienvenido al inventario', user: req.session.user });
});

// GET /settings - Protected by verifySession AND authorizeRole(['Admin'])
// "Protege la ruta crítica /settings o /ai-config"
router.get('/settings', authorizeRole(['Admin']), (req, res) => {
    res.json({ message: 'Configuración del sistema (Solo Admin)' });
});

// Other inventory routes can be added here
router.get('/items', (req, res) => {
    res.json({ items: [] });
});

module.exports = router;
