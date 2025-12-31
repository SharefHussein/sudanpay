import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  document.getElementById("email").innerText = user.email;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    document.getElementById("balance").innerText = snap.data().balance + " SDG";
  }
});
