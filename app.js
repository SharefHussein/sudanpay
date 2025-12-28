// 1. إعدادات Firebase الخاصة بك (Sudan Pay Config)
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// تهيئة Firebase بالإصدار v8
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- نظام التنبيهات الزجاجي الاحترافي ---
window.showNotify = function(message, type = "success") {
    const notif = document.createElement("div");
    notif.style.cssText = `
        position: fixed; top: 25px; left: 50%; transform: translateX(-50%) translateY(-120%);
        padding: 16px 32px; border-radius: 20px; z-index: 10000; font-size: 14px; font-weight: 900;
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); backdrop-filter: blur(15px);
        border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center; min-width: 250px;
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
        notif.style.transform = "translateX(-50%) translateY(-150%)";
        setTimeout(() => notif.remove(), 500);
    }, 3000);
};

// --- دالة تسجيل الدخول ---
window.login = async function() {
    const email = document.getElementById("email")?.value.trim();
    const pass = document.getElementById("password")?.value;
    if (!email || !pass) { showNotify("أدخل البيانات المطلوبة", "error"); return; }
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        window.location.href = "dashboard.html";
    } catch (e) {
        showNotify("البريد أو كلمة المرور غير صحيحة", "error");
    }
};

// --- دالة إرسال الأموال المتقدمة ---
window.sendMoney = async function() {
    const to = document.getElementById("toEmail")?.value.trim();
    const amt = Number(document.getElementById("amount")?.value);
    const user = auth.currentUser;
    if (!to || amt <= 0) { showNotify("أدخل بيانات تحويل صحيحة", "error"); return; }
    try {
        const snap = await db.collection("users").where("email", "==", to).get();
        if (snap.empty) throw "المستلم غير موجود في النظام";
        const recRef = snap.docs[0].ref;
        const senRef = db.collection("users").doc(user.uid);
        await db.runTransaction(async (t) => {
            const sDoc = await t.get(senRef);
            const balance = sDoc.data().balance || 0;
            if (balance < amt) throw "رصيدك غير كافٍ للعملية";
            t.update(senRef, { balance: balance - amt });
            const rDoc = await t.get(recRef);
            t.update(recRef, { balance: (rDoc.data().balance || 0) + amt });
            t.set(db.collection("transactions").doc(), {
                from: user.email, to, amount: amt, 
                participants: [user.email, to], 
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        showNotify("تم تحويل المبلغ بنجاح ✅");
        setTimeout(() => window.location.href = "dashboard.html", 2000);
    } catch (e) { showNotify(e, "error"); }
};

// --- حماية الصفحات وتوجيه المستخدمين ---
auth.onAuthStateChanged(user => {
    const path = window.location.pathname;
    const isInside = path.includes("dashboard") || path.includes("profile") || path.includes("send") || path.includes("receive");
    if (!user && isInside) {
        window.location.href = "login.html";
    }
});
