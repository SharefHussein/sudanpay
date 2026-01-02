import { auth } from "./app.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.loginEmail = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) return alert("أدخل البريد وكلمة المرور");

  signInWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(e => alert("خطأ: " + e.message));
};

window.loginWithGoogle = () => {
  import { provider } from "./app.js";
  import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  signInWithPopup(auth, provider)
    .then(() => window.location.href = "dashboard.html")
    .catch(e => alert(e.message));
};
