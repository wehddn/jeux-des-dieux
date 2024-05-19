import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const getOrCreateUserName = async (userId) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.name;
    } else {
      await setDoc(userRef, { name: 'Player' });
      return 'Player';
    }
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

export { getOrCreateUserName };
