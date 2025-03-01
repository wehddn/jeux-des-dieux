const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id', authMiddleware, userController.getUserById);
router.post('/', authMiddleware, userController.createUser);
router.patch('/:id', authMiddleware, userController.updateUserName);
router.get('/:id/role', authMiddleware, userController.getUserRole);
router.put('/:id/role', authMiddleware, userController.updateUserRole);
router.get('/', authMiddleware, userController.getUsers);
router.delete('/:id', authMiddleware, userController.deleteUserProfile);

module.exports = router;
