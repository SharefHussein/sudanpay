// Import Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

// Import Firebase Auth
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Export auth (لو عندك ملفات تانية)
export { auth };
