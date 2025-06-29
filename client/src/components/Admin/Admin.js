import { useState, useEffect } from 'react';
import { getUsers, updateUserRole, getBlockedUsers, blockUser, unblockUser, getAuditLogs } from '../../bd/Users';
import { ROLES } from '../../utils/roleUtils';
import { useUserAuth } from '../../context/UserAuthContext';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
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

  // Helper function to determine action type from old_data and new_data
  const getActionType = (oldData, newData) => {
    if (!oldData || oldData === 'null') return 'INSERT';
    if (!newData || newData === 'null') return 'DELETE';
    return 'UPDATE';
  };

  // Helper function to get changes between old and new data
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
    const fetchData = async () => {
      try {
        const promises = [
          getUsers(),
          getBlockedUsers()
        ];
        
        // Only fetch audit logs for admins
        if (isAdmin) {
          promises.push(getAuditLogs(20)); // Get last 20 logs
        }
        
        const results = await Promise.all(promises);
        const [userList, blockedList, auditList] = results;
        
        console.log('User list:', userList);
        console.log('Blocked users:', blockedList);
        setUsers(userList);
        setBlockedUsers(blockedList || []);
        
        if (isAdmin && auditList) {
          console.log('Audit logs:', auditList);
          console.log('First audit log entry:', auditList.logs[0]); // Debug the structure
          // Extract the logs array from the response object
          setAuditLogs(auditList.logs || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

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

      {/* Audit Logs - Only visible to admins */}
      {isAdmin && (
        <div>
          <h1>Recent Audit Logs</h1>
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
                              <pre className="changes-json">
                                {JSON.stringify(changes, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="no-changes">No changes</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-logs">
                      No audit logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
};

export default Admin;
