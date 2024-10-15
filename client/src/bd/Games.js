import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getUser = async (userId) => {
  const userRef = doc(db, 'Users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.error('No such user!');
      return null;
    }
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

export const createGame = async ({ name, userId, isPrivate, password }) => {
  try {
    const gameData = {
      name: name || "",
      players: [{ id: userId }],
      started: false,
      isPrivate: Boolean(isPrivate),
    };

    if (isPrivate && password) {
      gameData.password = password;
    }

    const gameRef = await addDoc(collection(db, "Games"), gameData);
    return gameRef.id;
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    throw error;
  }
};

export const getGamesList = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Games"));
    const gamesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      isPrivate: doc.data().isPrivate,
      players: doc.data().players,
      password: doc.data().password,
    }));
    return gamesList;
  } catch (error) {
    console.error("Ошибка при получении списка игр:", error);
    throw error;
  }
};
