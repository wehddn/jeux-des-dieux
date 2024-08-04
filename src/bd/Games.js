import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Функция для создания новой игры
export const createGame = async (gameName, userId) => {
  try {
    const gameRef = await addDoc(collection(db, "Games"), {
      name: gameName,
      players: [],
      started: false,
    });
    return gameRef.id;
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    throw error;
  }
};

export const getGamesList = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Games"));
    const gamesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
    return gamesList;
  } catch (error) {
    console.error("Ошибка при получении списка игр:", error);
    throw error;
  }
};