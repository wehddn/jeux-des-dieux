import { useState, useEffect } from 'react';
import { getUsers, updateUserRole } from '../../bd/Users';
import { ROLES } from '../../utils/roleUtils';

const ManageRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await getUsers();
      console.log('User list:', userList);
      setUsers(userList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, roleId) => {
    try {
      await updateUserRole(userId, parseInt(roleId));
      alert(`Role updated to ${roleId}`);
      // Refresh users list to show updated role
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main>
      <h1>Manage User Roles</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} :
            <select style={{ marginLeft: '0.5rem' }}
              value={user.role_id}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
            >
              <option value={ROLES.USER}>User</option>
              <option value={ROLES.MANAGER}>Manager</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default ManageRoles;
