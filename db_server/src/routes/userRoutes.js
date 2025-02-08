const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/:id
router.get('/:id', userController.getUserById);

// POST /api/users
router.post('/', userController.createUser);

router.patch('/:id', userController.updateUserName);

module.exports = router;
