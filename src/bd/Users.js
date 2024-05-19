import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const getOrCreateUser = async (userId, userEmail) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return { id: userId, email: userEmail, ...userData };
    } else {
      const newUser = { name: 'Player' };
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

export { getOrCreateUser, getUserPhoto, getUser, updateUserName, deleteUserProfile };
