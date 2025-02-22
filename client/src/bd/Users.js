const API_URL = 'http://localhost:5000/api';

// Получение или создание пользователя в MySQL
const getOrCreateUser = async (userId, userEmail) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);

    if (response.status === 404) {
      // Если пользователя нет, создаём нового
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
    console.error("Ошибка при получении пользователя:", error);
    throw new Error("Ошибка работы с API");
  }
};

const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Пользователь не найден");
        return null;
      }
      throw new Error("Ошибка сервера");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    throw new Error("Ошибка работы с API");
  }
};

const getUserName = async (userId) => {
  try {
    const userData = await getUser(userId);
    return userData ? userData.name : null;
  } catch (error) {
    console.error("Ошибка при получении имени пользователя:", error);
    throw new Error("Ошибка работы с API");
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
      throw new Error('Ошибка при обновлении имени пользователя');
    }

    return await response.json(); 
  } catch (error) {
    console.error('Ошибка в updateUserName:', error);
    throw new Error('Ошибка при работе с API');
  }
};


const deleteUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Ошибка при удалении пользователя');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка в deleteUserProfile:', error);
    throw new Error('Ошибка работы с API');
  }
};

const getNonFriendUsers = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/friends/${userId}/non-friends`);
    if (!response.ok) {
      throw new Error('Ошибка при получении списка не-друзей');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка в getNonFriendUsers:', error);
    throw new Error('Ошибка работы с API');
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
      throw new Error('Ошибка при отправке заявки в друзья');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка в addFriend:', error);
    throw new Error('Ошибка работы с API');
  }
};

const getPendingFriendRequests = async (userId) => {
  try {
    console.log('userId:', userId);
    const response = await fetch(`${API_URL}/friends/${userId}/pending-requests`);
    if (!response.ok) {
      throw new Error('Ошибка при получении входящих заявок в друзья');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка в getPendingFriendRequests:', error);
    throw new Error('Ошибка работы с API');
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
      throw new Error('Ошибка при принятии заявки');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка в acceptFriendRequest:', error);
    throw new Error('Ошибка работы с API');
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
      throw new Error('Ошибка при отклонении заявки в друзья');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка в declineFriendRequest:', error);
    throw new Error('Ошибка работы с API');
  }
};

const getFriendsList = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/friends/${userId}/list`);
    if (!response.ok) {
      throw new Error('Ошибка при получении списка друзей');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка в getFriendsList:', error);
    throw new Error('Ошибка работы с API');
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
      throw new Error('Ошибка при обновлении роли пользователя');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка в updateUserRole:', error);
    throw new Error('Ошибка работы с API');
  }
};

const getUserRole = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/role`);
    if (!response.ok) {
      throw new Error('Ошибка при получении роли пользователя');
    }
    const data = await response.json();
    return data.role; // Возвращаем только роль
  } catch (error) {
    console.error('Ошибка в getUserRole:', error);
    throw new Error('Ошибка работы с API');
  }
};

const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Ошибка при получении списка пользователей');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка в getUsers:', error);
    throw new Error('Ошибка работы с API');
  }
};

export { getOrCreateUser, getUser, getUserName, updateUserName, deleteUserProfile, getNonFriendUsers, addFriend, getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, getFriendsList, updateUserRole, getUserRole, getUsers};
