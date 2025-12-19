import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { app } from "./firebase.js";

const auth = getAuth(app);

// تسجيل حساب
window.register = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// تسجيل دخول
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// حماية الصفحات
onAuthStateChanged(auth, (user) => {
  if (!user && location.pathname.includes("dashboard")) {
    window.location.href = "login.html";
  }
});

// تسجيل خروج
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
