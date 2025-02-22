const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/', gameController.createGame);
router.get('/', gameController.getGamesList);
router.get("/:id", gameController.getGame);

module.exports = router;
