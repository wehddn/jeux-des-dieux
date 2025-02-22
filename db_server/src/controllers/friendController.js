// controllers/friendController.js
const db = require('../config/db');

// Отправить заявку (POST /api/friends) c body { user_id, friend_id }
exports.addFriend = async (req, res) => {
  try {
    const { user_id, friend_id } = req.body;

    // Проверяем, нет ли уже записи в таблице friends (в любом направлении)
    const [existing] = await db.query(
      'SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [user_id, friend_id, friend_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Добавляем новую запись со статусом 0 (например, 0 = "отправлено")
    await db.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 0)',
      [user_id, friend_id]
    );

    return res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Получить список входящих заявок в друзья (GET /api/friends/:id/pending-requests)
exports.getPendingFriendRequests = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Выбираем пользователей, которые отправили заявку (status = 0)
      const [rows] = await db.query(`
        SELECT users.id, users.name, users.email, users.photo
        FROM friends
        JOIN users ON friends.user_id = users.id
        WHERE friends.friend_id = ? AND friends.status = 0
      `, [userId]);
  
      return res.json(rows);
    } catch (error) {
      console.error('Ошибка при получении входящих заявок в друзья:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  };  

// Принять заявку (PUT /api/friends/accept) c body { user_id, friend_id }
// Логика: находим запись, где user_id = friend_id (отправитель), friend_id = user_id (получатель) И status = 0
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { user_id, friend_id } = req.body;
    // Логика зависит от того, как вы трактуете "user_id" и "friend_id".
    // Предположим, user_id — тот, кто принимает, friend_id — тот, кто отправил (или наоборот).
    // Ниже пример, что ищем: (user_id=friend_id, friend_id=user_id) со статусом 0.
    const [rows] = await db.query(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ? AND status = 0',
      [friend_id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Обновляем статус на 1 (принято)
    await db.query(
      'UPDATE friends SET status = 1 WHERE id = ?',
      [rows[0].id]
    );

    return res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Отклонить заявку (PUT /api/friends/decline)
exports.declineFriendRequest = async (req, res) => {
  try {
    const { user_id, friend_id } = req.body;

    // Проверяем, существует ли заявка со статусом 0 (ожидание)
    const [rows] = await db.query(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ? AND status = 0',
      [friend_id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found or already processed' });
    }

    // Обновляем статус на 2 (отклонено)
    await db.query(
      'UPDATE friends SET status = 2 WHERE id = ?',
      [rows[0].id]
    );

    return res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Ошибка при отклонении заявки в друзья:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить пользователей, с которыми нет записи в friends (GET /api/users/:userId/non-friends)
// Физически маршрут описан в userRoutes.js, но логика - тут
exports.getNonFriendUsers = async (req, res) => {
  try {
    const userId = req.params.id;

    // Выбираем из users всех, кроме userId
    // Исключаем тех, у кого есть запись в friends с этим userId (в любом статусе)
    // И в любом направлении:
    const [rows] = await db.query(`
      SELECT *
      FROM users
      WHERE id != ?
        AND id NOT IN (
          SELECT friend_id FROM friends WHERE user_id = ?
        )
        AND id NOT IN (
          SELECT user_id FROM friends WHERE friend_id = ?
        )
    `, [userId, userId, userId]);
    
    return res.json(rows);
  } catch (error) {
    console.error('Error getting non-friend users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Получить список друзей (GET /api/friends/:id/list)
exports.getFriendsList = async (req, res) => {
  try {
    const userId = req.params.id;

    // Получаем список друзей, исключая самого пользователя из выборки
    const [rows] = await db.query(`
      SELECT users.id, users.name, users.email, users.photo
      FROM friends
      JOIN users ON 
        (friends.friend_id = users.id AND friends.user_id = ?) 
        OR 
        (friends.user_id = users.id AND friends.friend_id = ?)
      WHERE friends.status = 1
    `, [userId, userId]);

    return res.json(rows);
  } catch (error) {
    console.error('Ошибка при получении списка друзей:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

