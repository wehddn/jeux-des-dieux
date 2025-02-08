const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Наш пул MySQL
//const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');

const app = express();

// Глобальные middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET','POST','PATCH']
}));

app.use(express.json());

// Проверка подключения к MySQL (опционально)
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Established connection to MySQL');
        connection.release();
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
    }
})();

//app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);

module.exports = app;