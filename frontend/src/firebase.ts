import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyBQcGC7zy4zcbnr8YSxabjqLpmEHdaxbk0",
    authDomain: "login-and--register-a2608.firebaseapp.com",
    projectId: "login-and--register-a2608",
    storageBucket: "login-and--register-a2608.firebasestorage.app",
    messagingSenderId: "250077679848",
    appId: "1:250077679848:web:a7c082aa838c2fe567f95d",
    measurementId: "G-PS7Z0J7337"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);