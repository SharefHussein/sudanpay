import { auth, db, generateAccountID } from "./app.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.signUpEmail = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) return alert("أدخل البريد وكلمة المرور");

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (cred) => {
      const user = cred.user;
      const accountID = generateAccountID();
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        accountID: accountID,
        balanceSDG: 1000.00,
        balanceUSDT: 0,
        createdAt: serverTimestamp()
      });
      alert(`تم إنشاء الحساب! رقم حسابك: ${accountID}\nهدية 1000 جنيه رصيد 🎉`);
      window.location.href = "dashboard.html";
    })
    .catch(e => alert("خطأ: " + e.message));
};
