const db = require("../config/db");

exports.createGame = async (req, res) => {
  try {
    const { name, userId, isPrivate, password } = req.body;

    const gameData = {
      name: name || "",
      isPrivate: Boolean(isPrivate),
      password: isPrivate ? password : null,
      started: false,
    };

    const [result] = await db.query(
      "INSERT INTO games (name, isPrivate, password, started) VALUES (?, ?, ?, ?)",
      [gameData.name, gameData.isPrivate, gameData.password, gameData.started]
    );

    await db.query(
      "INSERT INTO game_players (game_id, player_id) VALUES (?, ?)",
      [result.insertId, userId]
    );

    return res.status(201).json({ gameId: result.insertId });
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getGamesList = async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT g.id, g.name, g.isPrivate, g.started, 
             (SELECT COUNT(*) FROM game_players gp WHERE gp.game_id = g.id) AS playerCount
      FROM games g
    `);

    return res.json(games);
  } catch (error) {
    console.error("Ошибка при получении списка игр:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    const [gameRows] = await db.query(
      "SELECT id, name, isPrivate, password, started FROM games WHERE id = ?",
      [gameId]
    );

    if (gameRows.length === 0) {
      return res.status(404).json({ message: "Игра не найдена" });
    }

    const game = gameRows[0];

    const [players] = await db.query(
      "SELECT u.id, u.name, u.email, u.photo FROM game_players gp JOIN users u ON gp.player_id = u.id WHERE gp.game_id = ?",
      [gameId]
    );

    return res.json({ ...game, players });
  } catch (error) {
    console.error("Ошибка при получении информации об игре:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};
