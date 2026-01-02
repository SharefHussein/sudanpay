import { auth, db, increment } from "./app.js";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    document.getElementById("currentBalance").innerText = snap.data().balanceSDG.toFixed(2) + " SDG";
  }
});

window.sendMoney = async () => {
  const recipientID = document.getElementById("recipientID").value.trim();
  const amount = parseFloat(document.getElementById("sendAmount").value);

  if (!recipientID || isNaN(amount) || amount <= 0) {
    document.getElementById("sendStatus").innerText = "أدخل بيانات صحيحة";
    return;
  }

  const user = auth.currentUser;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const currentBalance = snap.data().balanceSDG;

  if (amount > currentBalance) {
    document.getElementById("sendStatus").innerText = "الرصيد غير كافي!";
    return;
  }

  await updateDoc(userRef, {
    balanceSDG: increment(-amount),
    transactions: arrayUnion({
      type: "send",
      to: recipientID,
      amount: amount,
      timestamp: serverTimestamp()
    })
  });

  document.getElementById("sendStatus").innerText = "تم الإرسال بنجاح! 🎉";
  document.getElementById("sendAmount").value = "";
  loadBalance();
};
