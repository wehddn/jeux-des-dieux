// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBP0VkfeaqQxma2-wTAdefz3rp3iNrL9wc",
  authDomain: "jeux-des-dieux.firebaseapp.com",
  projectId: "jeux-des-dieux",
  storageBucket: "jeux-des-dieux.appspot.com",
  messagingSenderId: "41046335846",
  appId: "1:41046335846:web:9732b1e46cd7c6803e28a7",
  measurementId: "G-90015D90T5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;