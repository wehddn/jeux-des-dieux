const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, friendController.addFriend);
router.put('/accept', authMiddleware, friendController.acceptFriendRequest);
router.put('/decline', authMiddleware, friendController.declineFriendRequest);
router.get('/:id/non-friends', authMiddleware, friendController.getNonFriendUsers);
router.get('/:id/pending-requests', authMiddleware, friendController.getPendingFriendRequests);
router.get('/:id/list', authMiddleware, friendController.getFriendsList);

module.exports = router;
