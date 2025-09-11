// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC8AtUc6x4A8Lyy5B5NS-PJMQBFH7Oo2ys",
  authDomain: "projeto-bitrix-dashboard.firebaseapp.com",
  databaseURL: "https://projeto-bitrix-dashboard-default-rtdb.firebaseio.com",
  projectId: "projeto-bitrix-dashboard",
  storageBucket: "projeto-bitrix-dashboard.appspot.com",
  messagingSenderId: "406611887687",
  appId: "1:406611887687:web:a025e975883903d1975362"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
