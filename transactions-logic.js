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
    const data = snap.data();
    const list = document.getElementById("transactionsList");
    list.innerHTML = '';
    if (data.transactions && data.transactions.length > 0) {
      data.transactions.reverse().forEach(t => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
          <div>
            <p class="font-bold text-lg">${t.description || t.type}</p>
            <p class="text-sm text-gray-500">${new Date(t.timestamp.seconds * 1000).toLocaleString('ar-EG')}</p>
          </div>
          <p class="text-2xl font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}">
            \( {t.amount > 0 ? '+' : ''} \){t.amount.toFixed(2)} SDG
          </p>
        `;
        list.appendChild(div);
      });
    } else {
      list.innerHTML = '<p class="text-center text-gray-500 py-12 text-lg">لا توجد معاملات بعد</p>';
    }
  }
});
