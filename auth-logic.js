import { auth, db, provider } from "./app.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let isLogin = true;

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const googleBtn = document.getElementById("google-btn");
const toggleAuth = document.getElementById("toggle-auth");
const title = document.getElementById("auth-title");

function generateID() {
  return "SP-" + Math.floor(100000 + Math.random() * 900000);
}

toggleAuth.onclick = () => {
  isLogin = !isLogin;
  title.innerText = isLogin ? "تسجيل الدخول" : "إنشاء حساب";
  loginBtn.innerText = isLogin ? "دخول" : "تسجيل";
};

loginBtn.onclick = async () => {
  if (!email.value || !password.value) {
    alert("أدخل البريد وكلمة المرور");
    return;
  }

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: email.value,
        accountID: generateID(),
        balanceSDG: 0,
        balanceUSDT: 0,
        createdAt: serverTimestamp()
      });
    }
    window.location.href = "dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

googleBtn.onclick = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const ref = doc(db, "users", result.user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        email: result.user.email,
        accountID: generateID(),
        balanceSDG: 0,
        balanceUSDT: 0,
        createdAt: serverTimestamp()
      });
    }
    window.location.href = "dashboard.html";
  } catch (e) {
    alert("فشل تسجيل الدخول عبر Google");
  }
};
