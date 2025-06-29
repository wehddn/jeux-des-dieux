import { useState, useEffect } from 'react';
import { getUsers, updateUserRole, getBlockedUsers, blockUser, unblockUser } from '../../bd/Users';
import { ROLES } from '../../utils/roleUtils';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.id}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <select 
                    value={user.role_id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value={ROLES.USER}>User</option>
                    <option value={ROLES.MANAGER}>Manager</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    backgroundColor: !isUserBlocked(user.id) ? '#d4edda' : '#f8d7da',
                    color: !isUserBlocked(user.id) ? '#155724' : '#721c24'
                  }}>
                    {!isUserBlocked(user.id) ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button 
                    style={{ 
                      padding: '4px 8px', 
                      margin: '2px', 
                      border: 'none', 
                      borderRadius: '4px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => console.log('View user:', user.id)}
                  >
                    View
                  </button>
                  <button 
                    style={{ 
                      padding: '4px 8px', 
                      margin: '2px', 
                      border: 'none', 
                      borderRadius: '4px', 
                      backgroundColor: !isUserBlocked(user.id) ? '#dc3545' : '#28a745', 
                      color: 'white', 
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => handleBlockToggle(user.id)}
                  >
                    {!isUserBlocked(user.id) ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Admin;
