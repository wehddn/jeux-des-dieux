import { useState, useEffect } from 'react';
import { getUsers, updateUserRole, getBlockedUsers, blockUser, unblockUser } from '../../bd/Users';
import { ROLES } from '../../utils/roleUtils';
import { useUserAuth } from '../../context/UserAuthContext';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUserAuth();

  // Role definitions - single source of truth
  const roleDefinitions = [
    { id: ROLES.USER, name: 'User' },
    { id: ROLES.MANAGER, name: 'Manager' },
    { id: ROLES.ADMIN, name: 'Admin' }
  ];

  // Helper function to get role name
  const getRoleName = (roleId) => {
    const role = roleDefinitions.find(r => r.id === parseInt(roleId));
    return role ? role.name : 'Unknown';
  };

  // Check if current user is admin (can edit roles)
  const isAdmin = currentUser && currentUser.role >= ROLES.ADMIN;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userList, blockedList] = await Promise.all([
          getUsers(),
          getBlockedUsers()
        ]);
        console.log('User list:', userList);
        console.log('Blocked users:', blockedList);
        setUsers(userList);
        setBlockedUsers(blockedList || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, roleId) => {
    try {
      await updateUserRole(userId, parseInt(roleId));
      // TODO : use role name
      alert(`Role updated to ${roleId}`);
      // Refresh users list to show updated role
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Helper function to check if user is blocked
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
      
      // Refresh blocked users list to show updated status
      const blockedList = await getBlockedUsers();
      setBlockedUsers(blockedList || []);
    } catch (error) {
      console.error('Error toggling block status:', error);
      alert('Error updating user block status');
    }
  };

  if (loading) return <p>Loading...</p>;
// TODO : get roles from BD for maintenance
  return (
    <main>
      <h1>User Management</h1>
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
                    <button
                      className="btn btn-view"
                      onClick={() => console.log('View user:', user.id)}
                    > View </button>
                    <button
                      className={`btn ${blocked ? 'btn-unblock' : 'btn-block'}`}
                      onClick={() => handleBlockToggle(user.id)}
                    >
                      {blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              );})}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Admin;
