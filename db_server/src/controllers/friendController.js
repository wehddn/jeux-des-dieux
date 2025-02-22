const db = require('../config/db');

exports.addFriend = async (req, res) => {
  try {
    const { user_id, friend_id } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [user_id, friend_id, friend_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

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

exports.getPendingFriendRequests = async (req, res) => {
    try {
      const userId = req.params.id;
  
      const [rows] = await db.query(`
        SELECT users.id, users.name, users.email, users.photo
        FROM friends
        JOIN users ON friends.user_id = users.id
        WHERE friends.friend_id = ? AND friends.status = 0
      `, [userId]);
  
      return res.json(rows);
    } catch (error) {
      console.error('Error getting pending friend requests:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };  

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { user_id, friend_id } = req.body;
    const [rows] = await db.query(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ? AND status = 0',
      [friend_id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

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

exports.declineFriendRequest = async (req, res) => {
  try {
    const { user_id, friend_id } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ? AND status = 0',
      [friend_id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found or already processed' });
    }

    await db.query(
      'UPDATE friends SET status = 2 WHERE id = ?',
      [rows[0].id]
    );

    return res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getNonFriendUsers = async (req, res) => {
  try {
    const userId = req.params.id;

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

exports.getFriendsList = async (req, res) => {
  try {
    const userId = req.params.id;

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
    console.error('Error getting friends list:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

