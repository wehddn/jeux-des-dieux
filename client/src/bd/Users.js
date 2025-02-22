const API_URL = 'http://localhost:5000/api';

const getOrCreateUser = async (userId, userEmail) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);

    if (response.status === 404) {
      const newUser = {
        id: userId,
        email: userEmail,
        name: "Player",
        photo: "photo_1.png",
      };
      const createResponse = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!createResponse.ok) {
        throw new Error("Error creating user");
      }

      return newUser;
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting or creating user:", error);
    throw new Error("API error");
  }
};

const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);

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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_URL}/friends/${userId}/non-friends`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, friend_id: friendId }),
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
    const response = await fetch(`${API_URL}/friends/${userId}/pending-requests`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, friend_id: friendId }),
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, friend_id: friendId }),
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
    const response = await fetch(`${API_URL}/friends/${userId}/list`);
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
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_URL}/users/${userId}/role`);
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
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Error getting users list');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw new Error('API error');
  }
};

export { getOrCreateUser, getUser, getUserName, updateUserName, deleteUserProfile, getNonFriendUsers, addFriend, getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, getFriendsList, updateUserRole, getUserRole, getUsers};
