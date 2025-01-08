const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Malformed token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abdul');
        req.user = decoded; // Attach the decoded user information to the request
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(403).json({ message: 'Token is not valid or has expired' });
    }
};

module.exports = verifyToken;