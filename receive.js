// receive.js
import { auth } from "./firebase.js";

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("email").innerText = user.email;
});
