import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔹 إعدادات Firebase (زي ما هي عندك)
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// 🔹 تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* =========================
   🔐 تسجيل الدخول
========================= */
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("اكتب البريد وكلمة المرور");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

/* =========================
   🆕 إنشاء حساب
========================= */
window.register = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("اكتب البريد وكلمة المرور");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

/* =========================
   🚪 تسجيل خروج
========================= */
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

/* =========================
   🛡️ حماية الصفحات
========================= */
onAuthStateChanged(auth, (user) => {
  const page = window.location.pathname;

  if (!user && !page.includes("login") && !page.includes("register") && !page.includes("index")) {
    window.location.href = "login.html";
  }
});
