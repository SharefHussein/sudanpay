// ============================================
// SUDAN PAY - النسخة النهائية المبسطة
// ============================================

console.log("🚀 تحميل Sudan Pay...");

// 1. 🔧 إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
    authDomain: "sudanpay-e332a.firebaseapp.com",
    projectId: "sudanpay-e332a",
    storageBucket: "sudanpay-e332a.appspot.com",
    messagingSenderId: "699809447272",
    appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// 2. ⚡ تهيئة Firebase (فقط)
if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized");
        }
        console.log("✅ النظام جاهز");
    } catch (error) {
        console.error("❌ خطأ في Firebase:", error);
    }
}

// 3. 🔔 إشعارات بسيطة
window.showNotify = function(message, type = "success") {
    console.log("🔔:", message);
    alert((type === "success" ? "✅ " : "❌ ") + message);
};

// 4. 🔐 الدخول بجوجل - بدون تعقيدات
window.signInWithGoogle = function() {
    console.log("🔐 بدء الدخول بجوجل...");
    
    if (typeof firebase === 'undefined') {
        showNotify("جاري تحميل النظام...", "error");
        return;
    }
    
    // تهيئة إذا لم تكن موجودة
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
        .then(async (result) => {
            const user = result.user;
            console.log("✅ تم الدخول:", user.email);
            
            // إنشاء/تحديث ملف المستخدم
            const db = firebase.firestore();
            const userRef = db.collection("users").doc(user.uid);
            
            await userRef.set({
                name: user.displayName || "مستخدم جديد",
                email: user.email,
                photoURL: user.photoURL || "",
                balance: 1000.00,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }, { merge: true });
            
            showNotify(`مرحباً ${user.displayName || user.email}!`, "success");
            
            // الانتقال المباشر بدون تأخير
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("❌ خطأ:", error);
            showNotify("خطأ: " + error.message, "error");
        });
};

// 5. 📊 تحميل بيانات المستخدم (للوحة التحكم فقط)
window.loadUserData = async function() {
    console.log("📊 جاري تحميل البيانات...");
    
    if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
        console.log("⚠️ لا يوجد مستخدم مسجل");
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        const db = firebase.firestore();
        const userDoc = await db.collection("users").doc(user.uid).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            
            // تحديث الواجهة
            if (document.getElementById("userName")) {
                document.getElementById("userName").textContent = data.name || user.email;
            }
            if (document.getElementById("userEmail")) {
                document.getElementById("userEmail").textContent = user.email;
            }
            if (document.getElementById("userBalance")) {
                document.getElementById("userBalance").textContent = 
                    (data.balance || 0).toFixed(2) + " جنيه";
            }
            
            console.log("✅ بيانات محملة:", data);
            return data;
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل البيانات:", error);
    }
    
    return null;
};

// 6. 💰 إرسال الأموال
window.sendMoney = async function() {
    const toEmail = document.getElementById("toEmail")?.value.trim();
    const amount = parseFloat(document.getElementById("amount")?.value);
    
    if (!toEmail || !amount || amount <= 0) {
        showNotify("أدخل بيانات صحيحة", "error");
        return;
    }
    
    const user = firebase.auth().currentUser;
    if (!user) {
        showNotify("يجب تسجيل الدخول أولاً", "error");
        return;
    }
    
    try {
        const db = firebase.firestore();
        
        // البحث عن المستقبل
        const receiverQuery = await db.collection("users")
            .where("email", "==", toEmail)
            .get();
        
        if (receiverQuery.empty) {
            showNotify("المستخدم غير موجود", "error");
            return;
        }
        
        const receiverDoc = receiverQuery.docs[0];
        
        // التحويل
        await db.runTransaction(async (transaction) => {
            const senderRef = db.collection("users").doc(user.uid);
            const receiverRef = db.collection("users").doc(receiverDoc.id);
            
            const senderDoc = await transaction.get(senderRef);
            const receiverDoc = await transaction.get(receiverRef);
            
            const senderBalance = senderDoc.data().balance || 0;
            const receiverBalance = receiverDoc.data().balance || 0;
            
            if (senderBalance < amount) {
                throw new Error("رصيدك غير كافٍ");
            }
            
            transaction.update(senderRef, { balance: senderBalance - amount });
            transaction.update(receiverRef, { balance: receiverBalance + amount });
            
            transaction.set(db.collection("transactions").doc(), {
                from: user.email,
                to: toEmail,
                amount: amount,
                date: new Date().toLocaleString(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        showNotify(`تم تحويل ${amount.toFixed(2)} جنيه!`, "success");
        
        // تحديث البيانات
        setTimeout(() => {
            loadUserData();
            document.getElementById("toEmail").value = "";
            document.getElementById("amount").value = "";
        }, 1000);
        
    } catch (error) {
        showNotify("خطأ: " + error.message, "error");
    }
};

// 7. 🚪 تسجيل الخروج البسيط
window.logout = function() {
    if (typeof firebase !== 'undefined') {
        firebase.auth().signOut();
    }
    window.location.href = "index.html";
};

console.log("✅ Sudan Pay جاهز للاستخدام"); 
