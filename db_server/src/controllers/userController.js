const db = require('../config/db');

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const [rows] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { id, email, name, photo } = req.body;
        await db.query(
            'INSERT INTO users (id, email, name, photo) VALUES (?, ?, ?, ?)',
            [id, email, name, photo]
        );

        return res.status(201).json({ message: 'User created' });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserName = async (req, res) => {
    try {
      const userId = req.params.id;
      const { name } = req.body;
  
      const [result] = await db.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, userId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'Name updated successfully' });
    } catch (error) {
      console.error('Error updating user name:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
exports.getUserRole = async (req, res) => {
    try {
      const userId = req.params.id;
  
      const [rows] = await db.query(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.json({ role: rows[0].role });
    } catch (error) {
      console.error('Error getting user role:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

exports.getUsers = async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, role, photo FROM users'
      );
  
      return res.json(rows);
    } catch (error) {
      console.error('Error getting users:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
exports.updateUserRole = async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
  
      if (!role) {
        return res.status(400).json({ message: 'Role is required' });
      }
  
      const [result] = await db.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.json({ message: 'Role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

exports.deleteUserProfile = async (req, res) => {
    try {
      const userId = req.params.id;
  
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.json({ message: 'User profile deleted' });
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  