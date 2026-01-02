import { auth, db } from "./app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userName").innerText = user.displayName || "مستخدم Sudan Pay";
  document.getElementById("userEmail").innerText = user.email;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("accountID").innerText = data.accountID || "غير متوفر";
  }
});
