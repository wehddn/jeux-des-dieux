import { useState, useEffect } from 'react';
import { getUsers, updateUserRole, getBlockedUsers, blockUser, unblockUser, getAuditLogs, createUser, updateUser, deleteUser, deleteAuditLog, clearAuditLogs } from '../../bd/Users';
import { getGamesForAdmin, createGame, updateGame, deleteGame, updateGameStatus } from '../../bd/Games';
import { ROLES } from '../../utils/roleUtils';
import { useUserAuth } from '../../context/UserAuthContext';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createGameLoading, setCreateGameLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [showCreateGameForm, setShowCreateGameForm] = useState(false);
  const [showEditGameForm, setShowEditGameForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role_id: ROLES.USER });
  const [newGame, setNewGame] = useState({ name: '', isPrivate: false, password: '' });
  const { user: currentUser } = useUserAuth();

  const roleDefinitions = [
    { id: ROLES.USER, name: 'User' },
    { id: ROLES.MANAGER, name: 'Manager' },
    { id: ROLES.ADMIN, name: 'Admin' }
  ];

  const getRoleName = (roleId) => {
    const role = roleDefinitions.find(r => r.id === parseInt(roleId));
    return role ? role.name : 'Unknown';
  };

  const isAdmin = currentUser && currentUser.role >= ROLES.ADMIN;

  const getActionType = (oldData, newData) => {
    if (!oldData || oldData === 'null') return 'INSERT';
    if (!newData || newData === 'null') return 'DELETE';
    return 'UPDATE';
  };

  const getChanges = (oldData, newData) => {
    try {
      const old = oldData ? JSON.parse(oldData) : null;
      const newVal = newData ? JSON.parse(newData) : null;
      
      if (!old && newVal) {
        return { action: 'INSERT', new: newVal };
      } else if (old && !newVal) {
        return { action: 'DELETE', old: old };
      } else if (old && newVal) {
        return { action: 'UPDATE', old: old, new: newVal };
      }
      return null;
    } catch (e) {
      console.error('Error parsing audit data:', e);
      return null;
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [isAdmin]);

  const loadUsers = async () => {
    if (showUsers) {
      setShowUsers(false);
      return;
    }
    
    setUsersLoading(true);
    try {
      const [userList, blockedList] = await Promise.all([
        getUsers(),
        getBlockedUsers()
      ]);
      
      console.log('User list:', userList);
      console.log('Blocked users:', blockedList);
      setUsers(userList);
      setBlockedUsers(blockedList || []);
      setShowUsers(true);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadLogs = async () => {
    if (showLogs) {
      setShowLogs(false);
      return;
    }
    
    setLogsLoading(true);
    try {
      const auditList = await getAuditLogs(20); // Get last 20 logs
      console.log('Audit logs:', auditList);
      console.log('First audit log entry:', auditList.logs[0]); // Debug the structure
      // Extract the logs array from the response object
      setAuditLogs(auditList.logs || []);
      setShowLogs(true);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    try {
      await updateUserRole(userId, parseInt(roleId));
      // TODO : use role name
      alert(`Role updated to ${roleId}`);
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const isUserBlocked = (userId) => {
    return blockedUsers.some(blockedUser => blockedUser.user_id === userId || blockedUser.id === userId);
  };

  const handleBlockToggle = async (userId) => {
    try {
      const userIsBlocked = isUserBlocked(userId);
      
      if (userIsBlocked) {
        await unblockUser(userId);
        alert('User unblocked successfully');
      } else {
        await blockUser(userId);
        alert('User blocked successfully');
      }
      
      const blockedList = await getBlockedUsers();
      setBlockedUsers(blockedList || []);
    } catch (error) {
      console.error('Error toggling block status:', error);
      
      if (error.message.includes('permission')) {
        alert('You do not have permission to perform this action');
      } else if (error.message.includes('not found')) {
        alert('User not found');
      } else if (error.message.includes('already blocked')) {
        alert('User is already blocked');
      } else if (error.message.includes('not blocked')) {
        alert('User is not currently blocked');
      } else if (error.message.includes('Network error')) {
        alert('Network error: Unable to connect to server');
      } else {
        alert('Error updating user block status: ' + error.message);
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.name.trim()) {
      alert('Name is required');
      return;
    }
    
    if (!newUser.email.trim()) {
      alert('Email is required');
      return;
    }
    
    if (!newUser.password || newUser.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    setCreateUserLoading(true);
    try {
      console.log('Creating user with data:', newUser);
      const response = await createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role_id: newUser.role_id
      });
      
      console.log('User created successfully:', response);
      alert(`User "${newUser.name}" created successfully!`);
      
      setNewUser({ name: '', email: '', password: '', role_id: ROLES.USER });
      setShowCreateUserForm(false);
      
      if (showUsers) {
        await loadUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.message.includes('email already exists') || error.message.includes('duplicate')) {
        alert('A user with this email already exists');
      } else if (error.message.includes('validation')) {
        alert('Please check your input data');
      } else if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
        alert('You do not have permission to create users');
      } else {
        alert('Failed to create user. Please try again.');
      }
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditUserForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email
      });
      alert('User updated successfully');
      setEditingUser(null);
      setShowEditUserForm(false);
      if (showUsers) {
        await loadUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await deleteUser(userId);
        alert('User deleted successfully');
        if (showUsers) {
          await loadUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleDeleteAuditLog = async (logId) => {
    if (window.confirm('Are you sure you want to delete this audit log?')) {
      try {
        await deleteAuditLog(logId);
        alert('Audit log deleted successfully');
        if (showLogs) {
          await loadLogs();
        }
      } catch (error) {
        console.error('Error deleting audit log:', error);
        alert('Error deleting audit log');
      }
    }
  };

  const handleClearAllLogs = async () => {
    if (window.confirm('Are you sure you want to clear ALL audit logs? This action cannot be undone.')) {
      try {
        await clearAuditLogs();
        alert('All audit logs cleared successfully');
        if (showLogs) {
          await loadLogs();
        }
      } catch (error) {
        console.error('Error clearing audit logs:', error);
        alert('Error clearing audit logs');
      }
    }
  };

  const handleToggleGames = async () => {
    if (showGames) {
      setShowGames(false);
      return;
    }
    
    setGamesLoading(true);
    try {
      const gamesList = await getGamesForAdmin();
      setGames(gamesList);
      setShowGames(true);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setGamesLoading(false);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setCreateGameLoading(true);
    
    try {
      await createGame({
        name: newGame.name,
        userId: currentUser.id,
        isPrivate: newGame.isPrivate,
        password: newGame.password
      });
      
      alert('Game created successfully');
      setNewGame({ name: '', isPrivate: false, password: '' });
      setShowCreateGameForm(false);
      
      const gamesList = await getGamesForAdmin();
      setGames(gamesList);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game: ' + error.message);
    } finally {
      setCreateGameLoading(false);
    }
  };

  const handleEditGame = (game) => {
    setEditingGame({
      id: game.id,
      name: game.name,
      status: game.status,
      is_private: game.is_private,
      password: ''
    });
    setShowEditGameForm(true);
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: editingGame.name,
        status: editingGame.status,
        is_private: editingGame.is_private
      };

      if (editingGame.password && editingGame.password.trim() !== '') {
        updateData.password = editingGame.password.trim();
      }

      await updateGame(editingGame.id, updateData);
      
      alert('Game updated successfully');
      setShowEditGameForm(false);
      setEditingGame(null);
      
      const gamesList = await getGamesForAdmin();
      setGames(gamesList);
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game: ' + error.message);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      try {
        await deleteGame(gameId);
        alert('Game deleted successfully');
        
        const gamesList = await getGamesForAdmin();
        setGames(gamesList);
      } catch (error) {
        console.error('Error deleting game:', error);
        alert('Error deleting game: ' + error.message);
      }
    }
  };

  const handleGameStatusChange = async (gameId, status) => {
    try {
      await updateGameStatus(gameId, status);
      alert('Game status updated successfully');
      
      const gamesList = await getGamesForAdmin();
      setGames(gamesList);
    } catch (error) {
      console.error('Error updating game status:', error);
      alert('Error updating game status: ' + error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
// TODO : get roles from BD for maintenance
  return (
    <main>
      <h1>Admin Panel</h1>
      
      <div>
        <button 
          className="btn btn-primary" 
          onClick={loadUsers}
          disabled={usersLoading}
        >
          {usersLoading ? 'Loading...' : showUsers ? 'Hide Users' : 'Show Users'}
        </button>
        
        {showUsers && isAdmin && (
          <button 
            className="btn btn-success" 
            onClick={() => setShowCreateUserForm(true)}
            style={{ marginLeft: '10px' }}
          >
            Create User
          </button>
        )}
        
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            onClick={loadLogs}
            disabled={logsLoading}
            style={{ marginLeft: '10px' }}
          >
            {logsLoading ? 'Loading...' : showLogs ? 'Hide Logs' : 'Show Audit Logs'}
          </button>
        )}

        {showLogs && isAdmin && (
          <button 
            className="btn btn-danger" 
            onClick={handleClearAllLogs}
            style={{ marginLeft: '10px' }}
          >
            Clear All Logs
          </button>
        )}

        {isAdmin && (
          <button 
            className="btn btn-secondary" 
            onClick={handleToggleGames}
            disabled={gamesLoading}
            style={{ marginLeft: '10px' }}
          >
            {gamesLoading ? 'Loading...' : showGames ? 'Hide Games' : 'Show Games'}
          </button>
        )}
      </div>

      {showUsers && (
        <div>
          <h2>User Management</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const blocked = isUserBlocked(user.id);
                  return (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {isAdmin ? (
                          <select
                            className="role-select"
                            value={user.role_id}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          >
                            {roleDefinitions.map(role => (
                              <option key={role.id} value={role.id}> {role.name} </option>
                            ))}
                          </select>
                        ) : (
                          <span className="role-text">{getRoleName(user.role_id)}</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${ blocked ? 'status-blocked' : 'status-active'}`}>
                          {blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>
                        {(() => {
                          const isTargetAdmin = user.role_id === ROLES.ADMIN;
                          const canBlock = isAdmin || !isTargetAdmin; 
                          
                          return (
                            <button
                              className={`btn ${blocked ? 'btn-unblock' : 'btn-block'}`}
                              onClick={() => handleBlockToggle(user.id)}
                              disabled={!canBlock}
                              title={!canBlock ? 'Cannot block administrator' : ''}
                            >
                              {blocked ? 'Unblock' : 'Block'}
                            </button>
                          );
                        })()}
                        {isAdmin && (
                          <>
                            <button
                              className="btn btn-edit"
                              onClick={() => handleEditUser(user)}
                              style={{ marginLeft: '5px' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              style={{ marginLeft: '5px' }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAdmin && showLogs && (
        <div>
          <h2>Recent Audit Logs</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Table</th>
                  <th>Record ID</th>
                  <th>Changes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, index) => {
                    const action = getActionType(log.old_data, log.new_data);
                    const changes = getChanges(log.old_data, log.new_data);
                    
                    return (
                      <tr key={index}>
                        <td className="audit-date">
                          {new Date(log.changed_at).toLocaleString()}
                        </td>
                        <td className="audit-user">
                          {log.changed_by_name || `User ${log.changed_by}`}
                        </td>
                        <td className="audit-action">
                          <span className={`action-badge action-${action.toLowerCase()}`}>
                            {action}
                          </span>
                        </td>
                        <td className="audit-table">{log.table_name}</td>
                        <td className="audit-record">{log.record_id}</td>
                        <td className="audit-changes">
                          {changes ? (
                            <details>
                              <summary>View changes</summary>
                              <pre className="changes_json">
                                {JSON.stringify(changes, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="no-changes">No changes</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteAuditLog(log.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="no-logs">
                      No audit logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateUserForm && (
        <div 
          className="modal"
          onClick={(e) => {
            if (e.target.className === 'modal') {
              setShowCreateUserForm(false);
              setNewUser({ name: '', email: '', password: '', role_id: ROLES.USER });
            }
          }}
        >
          <div className="modal-content">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div>
                <label htmlFor="userName">Name: *</label>
                <input
                  id="userName"
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter user's full name"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="userEmail">Email: *</label>
                <input
                  id="userEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="userPassword">Password: *</label>
                <input
                  id="userPassword"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Password must be at least 6 characters long
                </small>
              </div>
              <div>
                <label htmlFor="userRole">Role:</label>
                <select
                  id="userRole"
                  value={newUser.role_id}
                  onChange={(e) => setNewUser({...newUser, role_id: parseInt(e.target.value)})}
                >
                  {roleDefinitions.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: '20px' }}>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={createUserLoading}
                >
                  {createUserLoading ? 'Creating...' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowCreateUserForm(false);
                    setNewUser({ name: '', email: '', password: '', role_id: ROLES.USER });
                  }}
                  style={{ marginLeft: '10px' }}
                  disabled={createUserLoading}
                >
                  Cancel
                </button>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                * Required fields
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditUserForm && editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div>
                <label htmlFor="editUserName">Name:</label>
                <input
                  id="editUserName"
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  placeholder="Enter user's full name"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="editUserEmail">Email:</label>
                <input
                  id="editUserEmail"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-success">Update</button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowEditUserForm(false);
                    setEditingUser(null);
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Note: To change user role, use the dropdown in the users table
              </div>
            </form>
          </div>
        </div>
      )}

      {showGames && (
        <div>
          <h2>Games Management</h2>
          <div style={{ marginBottom: '20px' }}>
            <button 
              className="btn btn-success" 
              onClick={() => setShowCreateGameForm(true)}
              disabled={createGameLoading}
            >
              Create Game
            </button>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Creator</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Players</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>{game.id}</td>
                    <td>{game.name}</td>
                    <td>
                      <div>
                        <strong>{game.creator_name}</strong>
                        <br />
                        <small>{game.creator_email}</small>
                      </div>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={game.status}
                        onChange={(e) => handleGameStatusChange(game.id, e.target.value)}
                      >
                        <option value="waiting">Waiting</option>
                        <option value="in_progress">In Progress</option>
                        <option value="finished">Finished</option>
                      </select>
                    </td>
                    <td>
                      <span className={`type-badge ${game.is_private ? 'type-private' : 'type-public'}`}>
                        {game.is_private ? 'Private' : 'Public'}
                      </span>
                    </td>
                    <td>{game.player_count || 0}</td>
                    <td>{new Date(game.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEditGame(game)}
                        style={{ marginRight: '5px' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateGameForm && (
        <div 
          className="modal"
          onClick={(e) => {
            if (e.target.className === 'modal') {
              setShowCreateGameForm(false);
              setNewGame({ name: '', isPrivate: false, password: '' });
            }
          }}
        >
          <div className="modal-content">
            <h3>Create New Game</h3>
            <form onSubmit={handleCreateGame}>
              <div>
                <label htmlFor="gameName">Name: *</label>
                <input
                  id="gameName"
                  type="text"
                  value={newGame.name}
                  onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                  placeholder="Enter game name"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="gamePassword">Password:</label>
                <input
                  id="gamePassword"
                  type="password"
                  value={newGame.password}
                  onChange={(e) => setNewGame({...newGame, password: e.target.value})}
                  placeholder="Enter game password (leave blank for no password)"
                  minLength={0}
                  maxLength={50}
                />
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={newGame.isPrivate}
                    onChange={(e) => setNewGame({...newGame, isPrivate: e.target.checked})}
                  />
                  Private Game
                </label>
              </div>
              <div style={{ marginTop: '20px' }}>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={createGameLoading}
                >
                  {createGameLoading ? 'Creating...' : 'Create Game'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowCreateGameForm(false);
                    setNewGame({ name: '', isPrivate: false, password: '' });
                  }}
                  style={{ marginLeft: '10px' }}
                  disabled={createGameLoading}
                >
                  Cancel
                </button>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                * Required fields
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditGameForm && editingGame && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Game</h3>
            <form onSubmit={handleUpdateGame}>
              <div>
                <label htmlFor="editGameName">Name:</label>
                <input
                  id="editGameName"
                  type="text"
                  value={editingGame.name}
                  onChange={(e) => setEditingGame({...editingGame, name: e.target.value})}
                  placeholder="Enter game name"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="editGamePassword">Password:</label>
                <input
                  id="editGamePassword"
                  type="password"
                  value={editingGame.password}
                  onChange={(e) => setEditingGame({...editingGame, password: e.target.value})}
                  placeholder="Enter game password"
                  minLength={0}
                  maxLength={50}
                />
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={editingGame.is_private}
                    onChange={(e) => setEditingGame({...editingGame, is_private: e.target.checked})}
                  />
                  Private Game
                </label>
              </div>
              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-success">Update</button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowEditGameForm(false);
                    setEditingGame(null);
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Game Form */}
      {showCreateGameForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Game</h3>
            <form onSubmit={handleCreateGame}>
              <div>
                <label htmlFor="createGameName">Game Name:</label>
                <input
                  id="createGameName"
                  type="text"
                  value={newGame.name}
                  onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                  placeholder="Enter game name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={newGame.isPrivate}
                    onChange={(e) => setNewGame({...newGame, isPrivate: e.target.checked})}
                  />
                  Private Game
                </label>
              </div>
              {newGame.isPrivate && (
                <div>
                  <label htmlFor="createGamePassword">Password:</label>
                  <input
                    id="createGamePassword"
                    type="password"
                    value={newGame.password}
                    onChange={(e) => setNewGame({...newGame, password: e.target.value})}
                    placeholder="Enter password for private game"
                  />
                </div>
              )}
              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-success" disabled={createGameLoading}>
                  {createGameLoading ? 'Creating...' : 'Create Game'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowCreateGameForm(false);
                    setNewGame({ name: '', isPrivate: false, password: '' });
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Game Form */}
      {showEditGameForm && editingGame && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Game</h3>
            <form onSubmit={handleUpdateGame}>
              <div>
                <label htmlFor="editGameName">Game Name:</label>
                <input
                  id="editGameName"
                  type="text"
                  value={editingGame.name}
                  onChange={(e) => setEditingGame({...editingGame, name: e.target.value})}
                  placeholder="Enter game name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div>
                <label htmlFor="editGameStatus">Status:</label>
                <select
                  id="editGameStatus"
                  value={editingGame.status}
                  onChange={(e) => setEditingGame({...editingGame, status: e.target.value})}
                  required
                >
                  <option value="waiting">Waiting</option>
                  <option value="in_progress">In Progress</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={editingGame.is_private}
                    onChange={(e) => setEditingGame({...editingGame, is_private: e.target.checked})}
                  />
                  Private Game
                </label>
              </div>
              {editingGame.is_private && (
                <div>
                  <label htmlFor="editGamePassword">Password:</label>
                  <input
                    id="editGamePassword"
                    type="password"
                    value={editingGame.password}
                    onChange={(e) => setEditingGame({...editingGame, password: e.target.value})}
                    placeholder="Enter new password (leave empty to keep current)"
                  />
                  <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                    Leave empty to keep the current password. Enter a new password to change it.
                  </small>
                </div>
              )}
              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-success">Update Game</button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowEditGameForm(false);
                    setEditingGame(null);
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Admin;
