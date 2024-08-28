import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBSReQcOqwi6QE-jx05wYIgIDktPF7HfnM",
  authDomain: "my-portfolio-72059.firebaseapp.com",
  projectId: "my-portfolio-72059",
  storageBucket: "my-portfolio-72059.appspot.com",
  messagingSenderId: "939240924884",
  appId: "1:939240924884:web:e6f464489f5ebfa570bd41",
  measurementId: "G-KXFHWHR2EP"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const analytics = getAnalytics(app);

export { db };
