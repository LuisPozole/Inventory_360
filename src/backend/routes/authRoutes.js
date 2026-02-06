const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// POST /login - Handle login logic
router.post('/login', authController.login);

// GET /logout - Handle logout
router.get('/logout', authController.logout);

// GET /login - Render login view
router.get('/login', (req, res) => {
    // Serving a simple HTML form for demonstration
    // In a real scenario, this might be res.render or res.sendFile pointing to frontend
    res.send(`
        <html>
            <head><title>Login</title></head>
            <body>
                <h1>Login</h1>
                <form action="/login" method="POST">
                    <input type="email" name="email" placeholder="Email" required /><br/>
                    <input type="password" name="password" placeholder="Password" required /><br/>
                    <button type="submit">Entrar</button>
                </form>
            </body>
        </html>
    `);
});

module.exports = router;
