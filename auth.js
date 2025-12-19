import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

window.register = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => location.href = "dashboard.html")
    .catch(err => alert(err.message));
};

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => location.href = "dashboard.html")
    .catch(err => alert(err.message));
};

window.logout = function () {
  signOut(auth).then(() => location.href = "login.html");
};

onAuthStateChanged(auth, user => {
  if (!user && location.pathname.includes("dashboard")) {
    location.href = "login.html";
  }
}); 
