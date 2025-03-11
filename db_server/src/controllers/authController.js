const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query('INSERT INTO users (name, email, photo, password) VALUES (?, ?, ?, ?)', ["Player", email, "photo_1.png", hashedPassword]);
        const newUserId = result.insertId;
       
        const token = jwt.sign({ id: newUserId, email }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(201).json({ token, message: 'User created' });
        } catch (error) {
        console.error('Error while registering:', error);
        return res.status(500).json({ message: 'Server error' });
        }
  };


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [userResult] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userResult.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }
        const user = userResult[0];
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Wrong password' });
        }
        
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error while logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
};