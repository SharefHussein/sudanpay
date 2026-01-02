import { auth, db } from "./app.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "auth.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();

  document.getElementById("displayID").innerText = data.accountID;
  document.getElementById("sdgBalance").innerText = data.balanceSDG;
  document.getElementById("usdtBalance").innerText = data.balanceUSDT;
});

document.getElementById("logoutBtn").onclick = () => {
  signOut(auth).then(() => window.location.href = "index.html");
};
