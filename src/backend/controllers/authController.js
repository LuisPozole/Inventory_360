const bcrypt = require('bcryptjs');

// Mock User for DB Simulation
// In a real app, this comes from the database
const mockUser = {
    ID_Usuario: 1,
    Nombre: 'Administrador',
    Email: 'admin@inventory360.com',
    Hash_Contrasena: '$2b$10$LVXdSfClItcMkl.58mMAn.G7MXxd2J7xbny0Nz3KaAxWRSKdSP1oO', // '123456'
    Rol: 'Admin'
};

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            // DB Simulation: Find user by email
            // const query = "SELECT * FROM Usuarios WHERE Email = ?";
            // const [user] = await db.execute(query, [email]);

            // For now, we compare with mockUser
            const user = (email === mockUser.Email) ? mockUser : null;

            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            // Validate password
            const isMatch = await bcrypt.compare(password, user.Hash_Contrasena);

            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            // Create Session
            req.session.user = {
                id: user.ID_Usuario,
                name: user.Nombre,
                email: user.Email,
                role: user.Rol
            };

            return res.json({
                message: 'Login exitoso',
                user: req.session.user
            });

        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al cerrar sesión' });
            }
            res.redirect('/login');
        });
    }
};

module.exports = authController;
