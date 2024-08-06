import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

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
    for (const [key, value] of Object.entries(gameData)) {
      if (value === undefined) {
        console.error(`Ошибка: Поле ${key} имеет недопустимое значение undefined`);
        throw new Error(`Поле ${key} имеет недопустимое значение: undefined`);
      }

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            for (const [subKey, subValue] of Object.entries(item)) {
              if (subValue === undefined) {
                console.error(`Ошибка: Поле ${key}[${index}].${subKey} имеет недопустимое значение undefined`);
                throw new Error(`Поле ${key}[${index}].${subKey} имеет недопустимое значение: undefined`);
              }
            }
          });
        } else {
          for (const [subKey, subValue] of Object.entries(value)) {
            if (subValue === undefined) {
              console.error(`Ошибка: Поле ${key}.${subKey} имеет недопустимое значение undefined`);
              throw new Error(`Поле ${key}.${subKey} имеет недопустимое значение: undefined`);
            }
          }
        }
      }
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
    const gamesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      password: doc.data().password,
    }));
    return gamesList;
  } catch (error) {
    console.error("Ошибка при получении списка игр:", error);
    throw error;
  }
};