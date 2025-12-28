// إعدادات Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
    authDomain: "sudanpay-e332a.firebaseapp.com",
    projectId: "sudanpay-e332a",
    storageBucket: "sudanpay-e332a.appspot.com",
    messagingSenderId: "699809447272",
    appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();

// دالة التحويل مع فحص الأمان (Validation)
window.sendMoney = async function() {
    const toEmail = document.getElementById('toEmail').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const user = auth.currentUser;

    if (!toEmail || isNaN(amount) || amount <= 0) {
        showNotify("بيانات غير صحيحة", "error");
        return;
    }

    try {
        const senderDoc = await db.collection("users").doc(user.uid).get();
        const currentBalance = senderDoc.data().balance;

        if (currentBalance < amount) {
            showNotify("عذراً، رصيدك غير كافٍ", "error");
            return;
        }

        // البحث عن المستلم
        const receiverSnap = await db.collection("users").where("email", "==", toEmail).get();
        if (receiverSnap.empty) {
            showNotify("المستلم غير موجود", "error");
            return;
        }

        const receiverDoc = receiverSnap.docs[0];
        const batch = db.batch();

        // 1. خصم من المرسل
        batch.update(db.collection("users").doc(user.uid), { balance: currentBalance - amount });
        // 2. إضافة للمستلم
        batch.update(db.collection("users").doc(receiverDoc.id), { balance: receiverDoc.data().balance + amount });
        // 3. تسجيل العملية
        const txRef = db.collection("transactions").doc();
        batch.set(txRef, {
            from: user.email,
            to: toEmail,
            amount: amount,
            participants: [user.email, toEmail],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();
        showNotify("تم التحويل بنجاح ✅");
        setTimeout(() => window.location.href = "dashboard.html", 2000);
    } catch (e) { showNotify("فشلت العملية", "error"); }
};
 
