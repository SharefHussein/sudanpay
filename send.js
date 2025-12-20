// send.js
import { auth, db } from "./firebase.js";
import { notify } from "./notifications.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.sendMoney = async function () {
  const toEmail = document.getElementById("toEmail").value;
  const amount = Number(document.getElementById("amount").value);

  if (!toEmail || amount <= 0) {
    alert("أدخل بيانات صحيحة");
    return;
  }

  const sender = auth.currentUser;
  if (!sender) {
    alert("غير مسجل دخول");
    return;
  }
// حد أقصى للتحويل
if (amount > 500000) {
  alert("الحد الأقصى للتحويل 500,000");
  return;
}
  try  notify("تم التحويل بنجاح 💸");
  {
  
    // البحث عن المستلم بالإيميل
    const q = query(collection(db, "users"), where("email", "==", toEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      alert("المستلم غير موجود");
      return;
    }

    const receiverDoc = snap.docs[0];
    const receiverId = receiverDoc.id;

    const senderRef = doc(db, "users", sender.uid);
    const receiverRef = doc(db, "users", receiverId);

    await runTransaction(db, async (transaction) => {
      const senderSnap = await transaction.get(senderRef);
      const receiverSnap = await transaction.get(receiverRef);

      const senderBalance = senderSnap.data().balance;

      if (senderBalance < amount) {
        throw new Error("رصيد غير كافي");
      }

      transaction.update(senderRef, {
        balance: senderBalance - amount
      });

      transaction.update(receiverRef, {
        balance: receiverSnap.data().balance + amount
      });

      // تسجيل العملية
      await addDoc(collection(db, "transactions"), {
  from: sender.email,
  to: toEmail,
  amount,
  participants: [sender.email, toEmail],
  createdAt: serverTimestamp()
});
    });

    alert("تم الإرسال بنجاح");
    window.location.href = "dashboard.html";

  } catch (error) {
    notify("فشل التحويل ❌", "error");
  }
};
