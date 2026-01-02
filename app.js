// app.js - كامل لكل الصفحات
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.firebasestorage.app",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add",
  measurementId: "G-XRN6CBLKXY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// توليد ID عشوائي لكل مستخدم
export function generateAccountID() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SP-${random}`;
}

// مراقبة الدخول (حماية الصفحات)
onAuthStateChanged(auth, (user) => {
  const protectedPages = ['dashboard.html', 'profile.html', 'send.html', 'receive.html', 'transactions.html', 'settings.html', 'support.html'];
  const authPages = ['auth.html', 'login.html'];

  if (user) {
    if (authPages.some(page => window.location.pathname.includes(page))) {
      window.location.href = "dashboard.html";
    }
  } else {
    if (protectedPages.some(page => window.location.pathname.includes(page))) {
      window.location.href = "login.html";
    }
  }
});
