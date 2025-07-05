const API_URL = 'http://localhost:5000';

const getAuthHeaders = (additionalHeaders = {}) => {
  const token = localStorage.getItem("token");
  return token
    ? { ...additionalHeaders, Authorization: `Bearer ${token}` }
    : additionalHeaders;
};

const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn("User not found");
        return null;
      }
      throw new Error("Server error");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting user:", error);
    throw new Error("API error");
  }
};

const getUserName = async (userId) => {
  try {
    const userData = await getUser(userId);
    return userData ? userData.name : null;
  } catch (error) {
    console.error("Error getting user name:", error);
    throw new Error("API error");
  }
};

const updateUserName = async (userId, newName) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error('Error updating user name');
    }

    return await response.json(); 
  } catch (error) {
    console.error('Error updating user name:', error);
    throw new Error('Error updating user name');
  }
};


const deleteUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    });

    if (!response.ok) {
      throw new Error('Error deleting user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteUserProfile:', error);
    throw new Error('API error');
  }
};

const getNonFriendUsers = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/friends/${userId}/non-friends`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Error getting non-friend users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getNonFriendUsers:', error);
    throw new Error('API error');
  }
};

const addFriend = async (userId, friendId) => {
  try {
    const response = await fetch(`${API_URL}/friends`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ receiver_id: friendId  }),
    });
    if (!response.ok) {
      throw new Error('Error adding friend');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in addFriend:', error);
    throw new Error('API error');
  }
};

const getPendingFriendRequests = async (userId) => {
  try {
    console.log('userId:', userId);
    const response = await fetch(`${API_URL}/friends/${userId}/pending-requests`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Error getting pending friend requests');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getPendingFriendRequests:', error);
    throw new Error('API error');
  }
};

const acceptFriendRequest = async (userId, friendId) => {
  try {
    console.log('userId:', userId);
    console.log('friendId:', friendId);
    const response = await fetch(`${API_URL}/friends/accept`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ sender_id: friendId }),
    });
    if (!response.ok) {
      throw new Error('Error accepting friend request');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in acceptFriendRequest:', error);
    throw new Error('API error');
  }
};

const declineFriendRequest = async (userId, friendId) => {
  try {
    const response = await fetch(`${API_URL}/friends/decline`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ sender_id: friendId }),
    });

    if (!response.ok) {
      throw new Error('Error declining friend request');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in declineFriendRequest:', error);
    throw new Error('API error');
  }
};

const getFriendsList = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/friends/${userId}/list`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Error getting friends list');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getFriendsList:', error);
    throw new Error('API error');
  }
};

const updateUserRole = async (userId, newRole) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
      throw new Error('Error updating user role');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('API error');
  }
};

const getUserRole = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Error getting user role');
    }
    const data = await response.json();
    return data.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw new Error('API error');
  }
};

const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Error getting users list');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw new Error('API error');
  }
};

const getBlockedUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/blocked-users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Error getting blocked users list');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getBlockedUsers:', error);
    throw new Error('API error');
  }
};

const blockUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/block`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        throw new Error(errorData.error || 'You do not have permission to block this user');
      } else if (response.status === 404) {
        throw new Error('User not found');
      } else if (response.status === 409) {
        throw new Error(errorData.error || 'User is already blocked');
      } else {
        throw new Error(errorData.error || 'Error blocking user');
      }
    }
    return await response.json();
  } catch (error) {
    console.error('Error in blockUser:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    
    if (error.message !== 'API error') {
      throw error;
    }
    throw new Error('API error');
  }
};

const unblockUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/block`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        throw new Error(errorData.error || 'You do not have permission to unblock this user');
      } else if (response.status === 404) {
        throw new Error(errorData.error || 'User not found or not blocked');
      } else {
        throw new Error(errorData.error || 'Error unblocking user');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in unblockUser:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    
    if (error.message !== 'API error') {
      throw error;
    }
    throw new Error('API error');
  }
};

const getAuditLogs = async (limit = 50, offset = 0) => {
  try {
    const response = await fetch(`${API_URL}/audit?limit=${limit}&offset=${offset}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Error getting audit logs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    throw new Error('API error');
  }
};

const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        throw new Error(errorData.message || 'Invalid user data provided');
      } else if (response.status === 409) {
        throw new Error('A user with this email already exists');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to create users');
      } else if (response.status === 422) {
        throw new Error('Validation error: Please check your input data');
      } else {
        throw new Error(errorData.message || 'Error creating user');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in createUser:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        throw new Error(errorData.error || 'Invalid user data provided');
      } else if (response.status === 404) {
        throw new Error('User not found');
      } else if (response.status === 409) {
        throw new Error('Email already exists');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to update users');
      } else {
        throw new Error(errorData.error || 'Error updating user');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in updateUser:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    
    if (error.message !== 'API error') {
      throw error;
    }
    throw new Error('API error');
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error deleting user');
    }
    
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    } else {
      return { message: 'User deleted successfully' };
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    
    if (error.message !== 'API error') {
      throw error;
    }
    throw new Error('API error');
  }
};

const deleteAuditLog = async (logId) => {
  try {
    const response = await fetch(`${API_URL}/audit/${logId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error deleting audit log');
    }
    
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    } else {
      return { message: 'Audit log deleted successfully' };
    }
  } catch (error) {
    console.error('Error in deleteAuditLog:', error);
    
    if (error.message !== 'API error') {
      throw error;
    }
    throw new Error('API error');
  }
};

const clearAuditLogs = async () => {
  try {
    const response = await fetch(`${API_URL}/audit/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error clearing audit logs');
    }
    
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    } else {
      return { message: 'All audit logs cleared successfully' };
    }
  } catch (error) {
    console.error('Error in clearAuditLogs:', error);
    
    if (error.message !== 'API error') {
      throw error;
    }
    throw new Error('API error');
  }
};

export { getUser, getUserName, updateUserName, deleteUserProfile, getNonFriendUsers, addFriend, getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, getFriendsList, updateUserRole, getUserRole, getUsers, getBlockedUsers, blockUser, unblockUser, getAuditLogs, createUser, updateUser, deleteUser, deleteAuditLog, clearAuditLogs};
