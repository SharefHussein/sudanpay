import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// تسجيل دخول
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(window.auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// تسجيل حساب
window.register = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(window.auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

// حماية الصفحات
onAuthStateChanged(window.auth, user => {
  const page = window.location.pathname;

  if (!user && page.includes("dashboard")) {
    window.location.href = "login.html";
  }
});

// تسجيل خروج
window.logout = function () {
  signOut(window.auth).then(() => {
    window.location.href = "login.html";
  });
};
