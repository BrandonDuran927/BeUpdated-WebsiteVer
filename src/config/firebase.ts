import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoP5-fnDbNr9qrQej01bQgmpAY--zQogQ",
  authDomain: "testttttttttttttttt22.firebaseapp.com",
  projectId: "testttttttttttttttt22",
  storageBucket: "testttttttttttttttt22.firebasestorage.app",
  messagingSenderId: "229312116413",
  appId: "1:229312116413:android:7fbf14d09ea8a87c1569d4",
  databaseURL:
    "https://testttttttttttttttt22-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

console.log("✅ Firebase initialized successfully!"); // ✅ Debugging Firestore initialization

export { auth, database, firestore, ref, set };
