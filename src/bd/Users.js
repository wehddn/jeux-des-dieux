import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const getOrCreateUser = async (userId, userEmail) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return { id: userId, email: userEmail, ...userData };
    } else {
      const newUser = { name: 'Player', photo: 'photo.png'};
      await setDoc(userRef, newUser);
      return { id: userId, email: userEmail, newUser };
    }
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

const getUser = async (userId) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    const userData = userSnap.data();
    return userData;

  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

const getUserPhoto = async (userId) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    const userData = userSnap.data();
    return userData.photo;

  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

const updateUserName = async (userId, newName) => {
  const userRef = doc(db, 'Users', userId);

  try {
    await setDoc(userRef, { name: newName }, { merge: true });
  } catch (error) {
    console.error('Error updating name:', error);
    throw new Error('Error updating name');
  }
};

const deleteUserProfile = async (userId) => {
  const userRef = doc(db, 'Users', userId);

  try {
    await deleteDoc(userRef);
    const user = auth.currentUser;

    if (user) {
      try {
        await user.delete();
        console.log('User profile deleted successfully');
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
          // The user's sign-in is too old. Ask them to sign in again.
          console.log('Please sign in again to delete your account.');
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
};

const getFilteredUsers = async (userId) => {
  const usersRef = collection(db, 'Users');
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const userData = userSnap.data();
    const sentRequests = userData.sentRequests || [];
    const receivedRequests = userData.receivedRequests || [];

    // Получаем всех пользователей
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      const otherUserData = { id: doc.id, ...doc.data() };
      
      // Исключаем самого пользователя, тех, кому он отправил заявку, и тех, кто отправил заявку ему
      if (
        otherUserData.id !== userId && // Исключаем самого пользователя
        !sentRequests.includes(otherUserData.id) && // Исключаем пользователей, которым отправлены заявки
        !receivedRequests.includes(otherUserData.id) // Исключаем пользователей, которые отправили заявку
      ) {
        users.push(otherUserData);
      }
    });

    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Error getting users');
  }
};


const addFriend = async (userId, friendId) => {
  const userRef = doc(db, 'Users', userId);
  const friendRef = doc(db, 'Users', friendId);

  try {
    const userSnap = await getDoc(userRef);
    const friendSnap = await getDoc(friendRef);

    if (userSnap.exists() && friendSnap.exists()) {
      const userData = userSnap.data();
      const friendData = friendSnap.data();

      const currentFriends = userData.friends || [];
      const sentRequests = userData.sentRequests || [];
      const receivedRequests = friendData.receivedRequests || [];

      // Проверка, если друг уже добавлен
      if (currentFriends.includes(friendId)) {
        console.log('Friend is already added');
        return;
      }

      // Проверка, если заявка уже отправлена
      if (sentRequests.includes(friendId)) {
        console.log('Friend request already sent');
        return;
      }

      // Добавляем заявку в отправленные у пользователя
      await updateDoc(userRef, { sentRequests: [...sentRequests, friendId] });

      // Добавляем заявку в полученные у друга
      await updateDoc(friendRef, { receivedRequests: [...receivedRequests, userId] });

      console.log('Friend request sent successfully');
    } else {
      throw new Error('User or friend not found');
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw new Error('Error sending friend request');
  }
};



export { getOrCreateUser, getUserPhoto, getUser, updateUserName, deleteUserProfile, getFilteredUsers, addFriend };
