import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// TODO: Replace with your Firebase project configuration
// You can get this by creating a project at console.firebase.google.com
const firebaseConfig = {
    apiKey: "",
    authDomain: "the-real-z.firebaseapp.com",
    projectId: "the-real-z",
    storageBucket: "the-real-z.firebasestorage.app",
    messagingSenderId: "853453550261",
    appId: "1:853453550261:web:31807b9e3dec20e93f44fc",
    measurementId: "G-ERBJ63EKHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
