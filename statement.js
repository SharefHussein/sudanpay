// statement.js
import { auth, db } from "./firebase.js";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const q = query(
    collection(db, "transactions"),
    where("from", "==", user.email)
  );

  const snap = await getDocs(q);
  const list = document.getElementById("transactions");

  if (snap.empty) {
    list.innerHTML = "<li>لا توجد عمليات</li>";
    return;
  }

  snap.forEach(doc => {
    const t = doc.data();
    const li = document.createElement("li");
    li.innerText = `أرسلت ${t.amount} SDG إلى ${t.to}`;
    list.appendChild(li);
  });
});
