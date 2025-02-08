const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

router.post('/', friendController.addFriend);

router.put('/accept', friendController.acceptFriendRequest);

router.put('/decline', friendController.declineFriendRequest);

router.get('/:id/non-friends', friendController.getNonFriendUsers);

router.get('/:id/pending-requests', friendController.getPendingFriendRequests);

module.exports = router;
