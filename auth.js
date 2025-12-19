import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("أدخل البريد وكلمة المرور");
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

window.register = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("أدخل البريد وكلمة المرور");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("تم إنشاء الحساب");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};
