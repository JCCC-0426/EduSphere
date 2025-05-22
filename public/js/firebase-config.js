import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRbSLYjorZOAgoW9KJku3ZQiE2W8_XZ8g",
  authDomain: "edusphere-13f43.firebaseapp.com",
  databaseURL: "https://edusphere-13f43-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "edusphere-13f43",
  storageBucket: "edusphere-13f43.firebasestorage.app",
  messagingSenderId: "796590651079",
  appId: "1:796590651079:web:1b178d6fa2d9fed67670e2",
  measurementId: "G-4FNNWY57PB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default firebaseConfig;
export { db };
