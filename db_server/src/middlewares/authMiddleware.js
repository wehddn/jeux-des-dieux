const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Отсутствует токен' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Неверный формат токена' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Неверный или просроченный токен' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = authMiddleware;
