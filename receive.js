import { auth } from "./firebase.js";

auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const email = user.email;
  document.getElementById("email").innerText = email;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(email)}`;
  document.getElementById("qr").src = qrUrl;
});
