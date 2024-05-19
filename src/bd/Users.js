import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const getOrCreateUser = async (userId) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData;
    } else {
      const newUser = { name: 'Player' };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

const getUserPhoto = async (userId) => {
    const userRef = doc(db, 'Users', userId);
  
    try {
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.photo;
      } else {
        console.error('Error accessing user');
        throw new Error('Error accessing user');
      }
    } catch (error) {
      console.error('Error accessing Firestore:', error);
      throw new Error('Error accessing Firestore');
    }
  };

export { getOrCreateUser, getUserPhoto };
