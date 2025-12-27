// 1. إعدادات Firebase (تأكد من مطابقة هذه البيانات لمشروعك في Firebase Console)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// --- نظام التنبيهات الزجاجي (Notifications) ---
window.showNotify = function(message, type = "success") {
    const notif = document.createElement("div");
    notif.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
        padding: 15px 30px; border-radius: 20px; z-index: 9999; font-size: 14px; font-weight: bold;
        transition: all 0.5s ease; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    if (type === "success") {
        notif.style.backgroundColor = "rgba(163, 230, 53, 0.9)";
        notif.style.color = "#000";
    } else {
        notif.style.backgroundColor = "rgba(239, 68, 68, 0.9)";
        notif.style.color = "#fff";
    }

    notif.innerText = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.style.transform = "translateX(-50%) translateY(0)", 100);
    setTimeout(() => {
        notif.style.transform = "translateX(-50%) translateY(-100px)";
        setTimeout(() => notif.remove(), 500);
    }, 3500);
};

// --- ميزة تحويل الأموال (Send Money) ---
window.sendMoney = async function () {
    const toEmail = document.getElementById("toEmail").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const sender = auth.currentUser;

    if (!toEmail || amount <= 0) {
        showNotify("الرجاء إدخال بيانات صحيحة", "error");
        return;
    }
    if (amount > 500000) {
        showNotify("الحد الأقصى للتحويل 500,000 SDG", "error");
        return;
    }
    if (sender && toEmail === sender.email) {
        showNotify("لا يمكنك التحويل لنفسك!", "error");
        return;
    }

    try {
        const receiverQuery = await db.collection("users").where("email", "==", toEmail).get();
        if (receiverQuery.empty) {
            showNotify("المستلم غير موجود في النظام", "error");
            return;
        }

        const receiverDoc = receiverQuery.docs[0];
        const receiverRef = receiverDoc.ref;
        const senderRef = db.collection("users").doc(sender.uid);

        await db.runTransaction(async (transaction) => {
            const senderSnap = await transaction.get(senderRef);
            const receiverSnap = await transaction.get(receiverRef);

            const senderBalance = senderSnap.data().balance || 0;
            if (senderBalance < amount) {
                throw "رصيد غير كافي!";
            }

            transaction.update(senderRef, { balance: senderBalance - amount });
            transaction.update(receiverRef, { balance: (receiverSnap.data().balance || 0) + amount });

            const txRef = db.collection("transactions").doc();
            transaction.set(txRef, {
                from: sender.email, to: toEmail, amount: amount,
                participants: [sender.email, toEmail],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        showNotify("تم التحويل بنجاح 💸", "success");
        setTimeout(() => window.location.href = "dashboard.html", 2000);

    } catch (error) {
        showNotify("فشل: " + error, "error");
    }
};

// --- جلب سجل العمليات (Transactions) ---
window.loadTransactions = function() {
    const list = document.getElementById("transactions-list");
    if (!list) return;

    const user = auth.currentUser;
    db.collection("transactions")
      .where("participants", "array-contains", user.email)
      .orderBy("createdAt", "desc").limit(10)
      .onSnapshot((snap) => {
          list.innerHTML = "";
          if (snap.empty) {
              list.innerHTML = "<p class='text-gray-500 text-center text-xs'>لا توجد عمليات</p>";
              return;
          }
          snap.forEach(doc => {
              const t = doc.data();
              const isOut = t.from === user.email;
              const item = document.createElement("div");
              item.className = "flex items-center justify-between p-4 bg-white/5 rounded-2xl mb-3 border border-white/5";
              item.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${isOut ? 'text-red-400 bg-red-400/10' : 'text-[#a3e635] bg-[#a3e635]/10'}">
                        <i class="fas ${isOut ? 'fa-arrow-up' : 'fa-arrow-down'} text-[10px]"></i>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold">${isOut ? 'إلى: ' + t.to : 'من: ' + t.from}</p>
                        <p class="text-[8px] text-gray-500">${t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleDateString() : 'الآن'}</p>
                    </div>
                </div>
                <p class="font-black text-sm ${isOut ? 'text-white' : 'text-[#a3e635]'}">${isOut ? '-' : '+'}${t.amount}</p>
              `;
              list.appendChild(item);
          });
      });
};

// --- تسجيل الخروج ---
window.logout = function() {
    auth.signOut().then(() => window.location.href = "login.html");
};
 
