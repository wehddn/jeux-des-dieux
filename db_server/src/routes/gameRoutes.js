const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, gameController.createGame);
router.get('/', authMiddleware, gameController.getGamesList);
router.get("/:id", authMiddleware, gameController.getGame);
router.put("/:id/players", authMiddleware, gameController.updatePlayersInGame);
router.delete("/:id", authMiddleware, gameController.deleteGame);
router.put("/:id/status", authMiddleware, gameController.updateGameStatus);

module.exports = router;
