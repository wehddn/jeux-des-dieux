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
      throw new Error('Error blocking user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in blockUser:', error);
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
      throw new Error('Error unblocking user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in unblockUser:', error);
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

export { getUser, getUserName, updateUserName, deleteUserProfile, getNonFriendUsers, addFriend, getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, getFriendsList, updateUserRole, getUserRole, getUsers, getBlockedUsers, blockUser, unblockUser, getAuditLogs};
