import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const list = document.getElementById("transactions");
  list.innerHTML = "";

  const q = query(
    collection(db, "transactions"),
    where("participants", "array-contains", user.email)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    list.innerHTML = "<p>لا توجد عمليات</p>";
    return;
  }

  snap.forEach(doc => {
    const t = doc.data();
    const div = document.createElement("div");

    if (t.to === user.email) {
      div.className = "tx in";
      div.innerText = `+ ${t.amount} من ${t.from}`;
    } else {
      div.className = "tx out";
      div.innerText = `- ${t.amount} إلى ${t.to}`;
    }

    list.appendChild(div);
  });
});
