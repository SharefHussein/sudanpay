import { auth, db } from "./app.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    document.getElementById("myAccountID").innerText = snap.data().accountID;
  }
});

window.copyID = () => {
  const id = document.getElementById("myAccountID").innerText;
  navigator.clipboard.writeText(id);
  alert("تم نسخ رقم الحساب!");
};
