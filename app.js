// 1. إعدادات Firebase
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
        notif.style.backgroundColor = "rgba(163, 230, 53, 0.95)";
        notif.style.color = "#000";
        notif.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else {
        notif.style.backgroundColor = "rgba(239, 68, 68, 0.95)";
        notif.style.color = "#fff";
        notif.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    }
    document.body.appendChild(notif);
    setTimeout(() => { notif.style.transform = "translateX(-50%) translateY(0)"; }, 100);
    setTimeout(() => {
        notif.style.transform = "translateX(-50%) translateY(-150%)";
        setTimeout(() => notif.remove(), 600);
    }, 3500);
};

// --- وظيفة تغيير كلمة المرور ---
window.changePassword = function() {
    const newPassword = prompt("أدخل كلمة المرور الجديدة (6 أحرف على الأقل):");
    if (newPassword && newPassword.length >= 6) {
        const user = auth.currentUser;
        user.updatePassword(newPassword).then(() => {
            showNotify("تم تغيير كلمة المرور بنجاح ✅", "success");
        }).catch((error) => {
            if (error.code === "auth/requires-recent-login") {
                showNotify("للأمان، يرجى إعادة تسجيل الدخول أولاً", "error");
            } else {
                showNotify(error.message, "error");
            }
        });
    } else if (newPassword) {
        showNotify("كلمة المرور ضعيفة جداً", "error");
    }
};

// --- وظيفة تعديل البيانات (الاسم ورقم الهاتف) ---
window.updateUserData = function() {
    const newName = prompt("أدخل الاسم الجديد:");
    const newPhone = prompt("أدخل رقم الهاتف الجديد:");
    if (newName || newPhone) {
        const user = auth.currentUser;
        const updateObj = {};
        if (newName) updateObj.name = newName;
        if (newPhone) updateObj.phone = newPhone;
        db.collection("users").doc(user.uid).update(updateObj).then(() => {
            showNotify("تم تحديث البيانات بنجاح ✅", "success");
            setTimeout(() => location.reload(), 1500);
        }).catch((err) => showNotify("فشل التحديث: " + err.message, "error"));
    }
};

// --- وظيفة حذف الحساب نهائياً ---
window.deleteAccount = function() {
    if (confirm("هل أنت متأكد؟ سيتم مسح بياناتك ورصيدك نهائياً!")) {
        const user = auth.currentUser;
        db.collection("users").doc(user.uid).delete().then(() => {
            user.delete().then(() => {
                window.location.replace("login.html");
            });
        }).catch(() => showNotify("يرجى تسجيل الدخول مجدداً قبل حذف الحساب", "error"));
    }
};

// --- دالة إرسال الأموال ---
window.sendMoney = async function () {
    const toEmail = document.getElementById("toEmail").value.trim();
    const amountInput = document.getElementById("amount");
    const amount = Number(amountInput.value);
    const sender = auth.currentUser;
    if (!toEmail || amount <= 0) {
        showNotify("أدخل بيانات صحيحة", "error"); return;
    }
    try {
        const receiverQuery = await db.collection("users").where("email", "==", toEmail).get();
        if (receiverQuery.empty) {
            showNotify("المستخدم غير موجود", "error"); return;
        }
        const receiverRef = receiverQuery.docs[0].ref;
        const senderRef = db.collection("users").doc(sender.uid);
        await db.runTransaction(async (transaction) => {
            const senderSnap = await transaction.get(senderRef);
            const receiverSnap = await transaction.get(receiverRef);
            const senderBalance = senderSnap.data().balance || 0;
            if (senderBalance < amount) throw "رصيدك غير كافٍ";
            transaction.update(senderRef, { balance: senderBalance - amount });
            transaction.update(receiverRef, { balance: (receiverSnap.data().balance || 0) + amount });
            const txRef = db.collection("transactions").doc();
            transaction.set(txRef, {
                from: sender.email, to: toEmail, amount,
                participants: [sender.email, toEmail],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        showNotify("تم التحويل بنجاح ✅", "success");
        setTimeout(() => window.location.href = "dashboard.html", 2500);
    } catch (error) { showNotify(error, "error"); }
};

// --- تسجيل الخروج ---
window.logout = function() {
    auth.signOut().then(() => window.location.replace("login.html"));
};
 
