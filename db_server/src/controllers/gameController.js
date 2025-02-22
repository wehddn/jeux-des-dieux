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
    console.error("Error creating game:", error);
    return res.status(500).json({ message: "Server error" });
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
    console.error("Error getting games list:", error);
    return res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Game not found" });
    }

    const game = gameRows[0];

    const [players] = await db.query(
      "SELECT u.id, u.name, u.email, u.photo FROM game_players gp JOIN users u ON gp.player_id = u.id WHERE gp.game_id = ?",
      [gameId]
    );

    return res.json({ ...game, players });
  } catch (error) {
    console.error("Error getting game:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updatePlayersInGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    const { players } = req.body;

    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ message: "Invalid players list" });
    }

    await db.query(
      "DELETE FROM game_players WHERE game_id = ?",
      [gameId]
    );

    for (const player of players) {
      await db.query(
        "INSERT INTO game_players (game_id, player_id) VALUES (?, ?)",
        [gameId, player.id]
      );
    }

    return res.json({ message: "Players updated" });
  } catch (error) {
    console.error("Error updating players in game:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    await db.query("DELETE FROM game_players WHERE game_id = ?", [gameId]);
    await db.query("DELETE FROM games WHERE id = ?", [gameId]);

    return res.json({ message: "Game deleted" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateGameStatus = async (req, res) => {
  try {
    const gameId = req.params.id;
    const { started } = req.body;

    if (typeof started !== "boolean") {
      return res.status(400).json({ message: "Invalid game status" });
    }

    await db.query("UPDATE games SET started = ? WHERE id = ?", [started, gameId]);

    return res.json({ message: "Status updated" });
  } catch (error) {
    console.error("Error updating game status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};