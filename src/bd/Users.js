import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const getOrCreateUser = async (userId, userEmail) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {id: userId, email: userEmail, ...userData };
    } else {
      const newUser = { name: 'Player' };
      await setDoc(userRef, newUser);
      return {id: userId, email: userEmail, newUser};
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

export { getOrCreateUser, getUserPhoto, getUser };
