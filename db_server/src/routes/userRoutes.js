const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getUserById);

router.post('/', userController.createUser);

router.patch('/:id', userController.updateUserName);

router.get('/:id/role', userController.getUserRole);

router.put('/:id/role', userController.updateUserRole);

router.get('/', userController.getUsers);

router.delete('/:id', userController.deleteUserProfile);

module.exports = router;
