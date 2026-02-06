/**
 * Middleware to verify if the user session is active.
 */
const verifySession = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    // Check if request expects JSON (AJAX)
    if (req.accepts('json') || req.xhr || (req.headers['content-type'] && req.headers['content-type'].includes('json'))) {
        return res.status(401).json({ message: 'Unauthorized: Session required' });
    }

    // If normal navigation, redirect to login
    return res.redirect('/login');
};

/**
 * Middleware to authorize specific roles.
 * @param {Array<string>} allowedRoles - List of allowed roles (e.g., ['Admin', 'Vendedor'])
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.user || !req.session.user.role) {
            // Should ideally be caught by verifySession, but double checking
            if (req.accepts('json')) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            return res.redirect('/login');
        }

        if (allowedRoles.includes(req.session.user.role)) {
            return next();
        }

        // Role mismatch
        return res.status(403).json({ message: 'Acceso restringido a administradores' });
    };
};

module.exports = {
    verifySession,
    authorizeRole
};
