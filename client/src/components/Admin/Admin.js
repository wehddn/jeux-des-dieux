import { useState, useEffect } from 'react';
import { getUsers, updateUserRole } from '../../bd/Users';

const ManageRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await getUsers();
      setUsers(userList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      alert(`Role updated to ${role}`);
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
            {user.name} - {user.role}
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default ManageRoles;
