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
/*  const userRef = doc(db, 'Users', userId);

  try {
    await deleteDoc(userRef);
    const user = auth.currentUser;

    if (user) {
      try {
        await user.delete();
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
        } else {
          console.error('Error deleting user profile:', error);
          throw new Error('Error deleting user profile');
        }
      }
    }
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw new Error('Error deleting user profile');
  }
    */
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
/*
  const userRef = doc(db, 'Users', userId);
  const friendRef = doc(db, 'Users', friendId);

  try {
    const userSnap = await getDoc(userRef);
    const friendSnap = await getDoc(friendRef);

    if (userSnap.exists() && friendSnap.exists()) {
      const userData = userSnap.data();
      const friendData = friendSnap.data();

      const userReceivedRequests = userData.receivedRequests || [];
      const updatedReceivedRequests = userReceivedRequests.filter(id => id !== friendId);

      await updateDoc(userRef, {
        receivedRequests: updatedReceivedRequests
      });

      const friendSentRequests = friendData.sentRequests || [];
      const updatedSentRequests = friendSentRequests.filter(id => id !== userId);

      await updateDoc(friendRef, {
        sentRequests: updatedSentRequests
      });

    } else {
      throw new Error("User or friend not found.");
    }
  } catch (error) {
    console.error("Error declining friend request:", error);
    throw new Error("Error declining friend request");
  }
  */
};

const updateUserRole = async (userId, newRole) => {
/*
  const userRef = doc(db, 'Users', userId);

  try {
    await updateDoc(userRef, { role: newRole });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Error updating user role');
  }
    */
};

const getUserRole = async (userId) => {
/*
  const userRef = doc(db, "Users", userId);

  try {
    let userSnap = await getDoc(userRef, { source: 'cache' });

    if (!userSnap.exists()) {
      console.log('No cached data, fetching from server...');
      userSnap = await getDoc(userRef, { source: 'server' });
    }

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role || "user";
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    throw new Error("Error getting user role");
  }
    */
};

const getUsers = async () => {
/*
  const usersRef = collection(db, "Users");

  try {
    const querySnapshot = await getDocs(usersRef);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Error fetching all users");
  }
    */
};



export { getOrCreateUser, getUser, getUserName, updateUserName, deleteUserProfile, getNonFriendUsers, addFriend, getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, updateUserRole, getUserRole, getUsers};
