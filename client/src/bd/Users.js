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
      const newUser = { name: 'Player', photo: 'photo_1.png', role: 'user'};
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
};

const getNonFriendUsers = async (userId) => {
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

    const querySnapshot = await getDocs(usersRef);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      const otherUserData = { id: doc.id, ...doc.data() };
      
      if (
        otherUserData.id !== userId &&
        !sentRequests.includes(otherUserData.id) &&
        !receivedRequests.includes(otherUserData.id)
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

      if (currentFriends.includes(friendId)) {
        return;
      }

      if (sentRequests.includes(friendId)) {
        return;
      }

      await updateDoc(userRef, { sentRequests: [...sentRequests, friendId] });

      await updateDoc(friendRef, { receivedRequests: [...receivedRequests, userId] });

    } else {
      throw new Error('User or friend not found');
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw new Error('Error sending friend request');
  }
};

const acceptFriendRequest = async (userId, friendId) => {
  const userRef = doc(db, 'Users', userId);
  const friendRef = doc(db, 'Users', friendId);

  try {
    const userSnap = await getDoc(userRef);
    const friendSnap = await getDoc(friendRef);

    if (userSnap.exists() && friendSnap.exists()) {
      const userData = userSnap.data();
      const friendData = friendSnap.data();

      const userFriends = userData.friends || [];
      const friendFriends = friendData.friends || [];

      const userReceivedRequests = userData.receivedRequests || [];
      const updatedReceivedRequests = userReceivedRequests.filter(id => id !== friendId);

      await updateDoc(userRef, {
        friends: [...userFriends, friendId],
        receivedRequests: updatedReceivedRequests
      });

      const friendSentRequests = friendData.sentRequests || [];
      const updatedSentRequests = friendSentRequests.filter(id => id !== userId);

      await updateDoc(friendRef, {
        friends: [...friendFriends, userId],
        sentRequests: updatedSentRequests
      });

    } else {
      throw new Error("User or friend not found.");
    }
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw new Error("Error accepting friend request");
  }
};

const declineFriendRequest = async (userId, friendId) => {
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
};

const updateUserRole = async (userId, newRole) => {
  const userRef = doc(db, 'Users', userId);

  try {
    await updateDoc(userRef, { role: newRole });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Error updating user role');
  }
};

const getUserRole = async (userId) => {
  const userRef = doc(db, "Users", userId);

  try {
    const userSnap = await getDoc(userRef);

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
};

const getUsers = async () => {
  const usersRef = collection(db, "Users");

  try {
    const querySnapshot = await getDocs(usersRef);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return users; // Возвращаем массив пользователей
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Error fetching all users");
  }
};



export { getOrCreateUser, getUserPhoto, getUser, updateUserName, deleteUserProfile, getNonFriendUsers, addFriend, acceptFriendRequest, declineFriendRequest, updateUserRole, getUserRole, getUsers};
