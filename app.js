// 1. إعدادات Firebase - تأكد من مطابقة هذه البيانات لمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// تهيئة الخدمة
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- نظام التنبيهات الزجاجي المطور ---
window.showNotify = function(message, type = "success") {
    const notif = document.createElement("div");
    notif.style.cssText = `
        position: fixed; top: 25px; left: 50%; transform: translateX(-50%) translateY(-120%);
        padding: 16px 32px; border-radius: 24px; z-index: 10000; font-size: 14px; font-weight: 900;
        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        display: flex; align-items: center; gap: 10px; min-width: 280px; justify-content: center;
    `;

    if (type === "success") {
        notif.style.backgroundColor = "rgba(163, 230, 53, 0.95)"; // أخضر ليموني
        notif.style.color = "#000";
        notif.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        notif.style.backgroundColor = "rgba(239, 68, 68, 0.95)"; // أحمر
        notif.style.color = "#fff";
        notif.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    }

    document.body.appendChild(notif);
    
    // ظهور التنبيه
    setTimeout(() => { notif.style.transform = "translateX(-50%) translateY(0)"; }, 100);

    // اختفاء التنبيه بعد 3 ثواني
    setTimeout(() => {
        notif.style.transform = "translateX(-50%) translateY(-150%)";
        setTimeout(() => notif.remove(), 600);
    }, 3500);
};

// --- دالة إرسال الأموال (Send Money) ---
window.sendMoney = async function () {
    const toEmail = document.getElementById("toEmail").value.trim();
    const amountInput = document.getElementById("amount");
    const amount = Number(amountInput.value);
    const sender = auth.currentUser;

    if (!toEmail || amount <= 0) {
        showNotify("يرجى إدخال بريد صحيح ومبلغ أكبر من صفر", "error");
        return;
    }
    if (amount > 500000) {
        showNotify("عذراً، الحد الأقصى للتحويل هو 500,000 ج.س", "error");
        return;
    }
    if (sender && toEmail === sender.email) {
        showNotify("لا يمكنك التحويل إلى حسابك الشخصي!", "error");
        return;
    }

    try {
        // البحث عن المستلم
        const receiverQuery = await db.collection("users").where("email", "==", toEmail).get();
        if (receiverQuery.empty) {
            showNotify("عذراً، هذا المستخدم غير مسجل لدينا", "error");
            return;
        }

        const receiverDoc = receiverQuery.docs[0];
        const receiverRef = receiverDoc.ref;
        const senderRef = db.collection("users").doc(sender.uid);

        // تنفيذ عملية التحويل الآمنة
        await db.runTransaction(async (transaction) => {
            const senderSnap = await transaction.get(senderRef);
            const receiverSnap = await transaction.get(receiverRef);

            const senderBalance = senderSnap.data().balance || 0;
            if (senderBalance < amount) {
                throw "رصيدك الحالي غير كافٍ لإتمام العملية";
            }

            // تحديث الأرصدة في قاعدة البيانات
            transaction.update(senderRef, { balance: senderBalance - amount });
            transaction.update(receiverRef, { balance: (receiverSnap.data().balance || 0) + amount });

            // تسجيل العملية في سجل الحركات
            const txRef = db.collection("transactions").doc();
            transaction.set(txRef, {
                from: sender.email,
                to: toEmail,
                amount: amount,
                participants: [sender.email, toEmail],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        showNotify("تم تحويل المبلغ بنجاح ✅", "success");
        amountInput.value = ""; // تفريغ الحقل
        
        // العودة للرئيسية بعد فترة قصيرة
        setTimeout(() => { window.location.href = "dashboard.html"; }, 2500);

    } catch (error) {
        showNotify(error, "error");
    }
};

// --- تسجيل الدخول بجوجل ---
window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => {
        window.location.replace("dashboard.html");
    }).catch(err => {
        if(err.code !== 'auth/popup-closed-by-user') showNotify("خطأ في الاتصال بجوجل", "error");
    });
};

// --- تسجيل الخروج ---
window.logout = function() {
    auth.signOut().then(() => {
        window.location.replace("login.html");
    });
};

// --- حماية الصفحات والتحقق من الهوية ---
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    const isProtected = path.includes("dashboard") || path.includes("profile") || path.includes("receive") || path.includes("send");
    
    if (!user && isProtected) {
        window.location.replace("login.html");
    }
});
 
