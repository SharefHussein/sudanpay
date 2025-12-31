// auth.js
import { notify } from "./notifications.js";
import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =======================
// Register (إنشاء حساب)
// =======================
window.register = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("أدخل الإيميل وكلمة المرور");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // إنشاء Wallet تلقائي
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      balance: 0,
      createdAt: serverTimestamp()
    });

    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
};

// =======================
// Login (تسجيل دخول)
// =======================
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("أدخل الإيميل وكلمة المرور");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
};

// =======================
// Logout (تسجيل خروج)
// =======================
window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

// =======================
// حماية الصفحات
// =======================
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;

  if (!user && path.includes("dashboard")) {
    window.location.href = "login.html";
    return;
  }

  if (user && path.includes("dashboard")) {
    // جلب الرصيد
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const balance = snap.data().balance;
      const el = document.getElementById("balance");
      if (el) el.innerText = balance + " SDG";
    }
  }
});
