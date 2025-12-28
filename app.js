// ============================================
// SUDAN PAY - تطبيق الدفع الرقمي (نسخة مستقرة)
// ============================================

// 1. 🔧 إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
    authDomain: "sudanpay-e332a.firebaseapp.com",
    projectId: "sudanpay-e332a",
    storageBucket: "sudanpay-e332a.appspot.com",
    messagingSenderId: "699809447272",
    appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// 2. ⚡ تهيئة Firebase
let auth, db;
let authChecked = false;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized");
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("✅ الخدمات جاهزة");
    
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
}

// 3. 🔔 نظام الإشعارات
window.showNotify = function(message, type = "success", duration = 4000) {
    console.log("🔔:", message);
    
    // إنشاء إشعار بسيط
    const notif = document.createElement("div");
    notif.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === "success" ? "#10b981" : "#ef4444"};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease-out;
        ">
            ${type === "success" ? "✅" : "❌"} ${message}
        </div>
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = "slideUp 0.3s ease-out forwards";
        setTimeout(() => notif.remove(), 300);
    }, duration);
};

// 4. 🔐 نظام المصادقة (مبسط وموثوق)
window.signInWithGoogle = async function() {
    if (!auth) {
        showNotify("النظام غير جاهز", "error");
        return;
    }
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // إنشاء ملف المستخدم
        const userRef = db.collection("users").doc(user.uid);
        await userRef.set({
            name: user.displayName || "مستخدم جديد",
            email: user.email,
            photoURL: user.photoURL || "",
            balance: 1000.00,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: new Date().toISOString()
        }, { merge: true });
        
        showNotify(`مرحباً ${user.displayName || user.email}!`, "success");
        
        // الانتقال بعد تأخير
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
        
    } catch (error) {
        console.error("Login error:", error);
        showNotify(`خطأ: ${error.message}`, "error");
    }
};

window.signInWithEmail = async function(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showNotify("تم الدخول بنجاح", "success");
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
        
    } catch (error) {
        showNotify(`خطأ: ${error.message}`, "error");
    }
};

window.registerWithEmail = async function(name, email, password, phone = "") {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;
        
        // إنشاء ملف المستخدم
        await db.collection("users").doc(user.uid).set({
            name: name,
            email: email,
            phone: phone,
            balance: 1000.00,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: new Date().toISOString()
        });
        
        showNotify(`تم إنشاء حساب ${name} بنجاح!`, "success");
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
        
    } catch (error) {
        showNotify(`خطأ: ${error.message}`, "error");
    }
};

// 5. 💰 نظام الدفع
window.sendMoney = async function(toEmail, amount, notes = "") {
    const user = auth.currentUser;
    if (!user) {
        showNotify("يجب تسجيل الدخول أولاً", "error");
        return;
    }
    
    try {
        // البحث عن المستقبل
        const receiverQuery = await db.collection("users").where("email", "==", toEmail).get();
        if (receiverQuery.empty) {
            showNotify("المستخدم غير موجود", "error");
            return;
        }
        
        const receiverDoc = receiverQuery.docs[0];
        
        // استخدام Transaction
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
            
            // تحديث الرصيد
            transaction.update(senderRef, { balance: senderBalance - amount });
            transaction.update(receiverRef, { balance: receiverBalance + amount });
            
            // تسجيل المعاملة
            transaction.set(db.collection("transactions").doc(), {
                from: user.email,
                to: toEmail,
                amount: amount,
                notes: notes,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        showNotify(`تم تحويل ${amount} جنيه بنجاح`, "success");
        return true;
        
    } catch (error) {
        showNotify(error.message, "error");
        return false;
    }
};

// 6. 📊 وظائف لوحة التحكم
window.loadUserData = async function() {
    const user = auth.currentUser;
    if (!user) {
        // إذا لم يكن مسجلاً، لا تحاول إعادة التوجيه هنا
        return null;
    }
    
    try {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) {
            return doc.data();
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
    
    return null;
};

// 7. 🚪 تسجيل الخروج
window.logout = function() {
    if (auth) {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    }
};

// 8. ⚡ نظام التحكم في التوجيه (مبسط ومضمون)
if (auth) {
    auth.onAuthStateChanged((user) => {
        // منع التكرار
        if (authChecked) return;
        authChecked = true;
        
        const currentPage = window.location.pathname.split("/").pop();
        console.log("🔍 تحقق:", user ? "مسجل" : "غير مسجل", "الصفحة:", currentPage);
        
        // تأخير 1.5 ثانية للتحقق
        setTimeout(() => {
            if (user) {
                // مسجل دخول
                if (currentPage === "index.html" || currentPage === "" || 
                    currentPage === "login.html" || currentPage === "register.html") {
                    console.log("➡️ توجيه إلى dashboard");
                    window.location.href = "dashboard.html";
                }
            } else {
                // غير مسجل
                if (currentPage === "dashboard.html") {
                    console.log("⬅️ توجيه إلى الرئيسية");
                    window.location.href = "index.html";
                }
            }
            
            // إعادة تعيين بعد 5 ثوانٍ
            setTimeout(() => {
                authChecked = false;
            }, 5000);
        }, 1500);
    });
}

// 9. 🛠️ وظائف مساعدة
window.formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + " جنيه";
};

window.formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

console.log("🚀 Sudan Pay App Loaded Successfully!");
