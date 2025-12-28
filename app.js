// ============================================
// SUDAN PAY - النسخة النهائية المستقرة
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
let isInitialized = false;

function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized");
        }
        
        auth = firebase.auth();
        db = firebase.firestore();
        isInitialized = true;
        
        console.log("✅ الخدمات جاهزة");
        return true;
    } catch (error) {
        console.error("❌ خطأ في تهيئة Firebase:", error);
        return false;
    }
}

// 3. 🔔 نظام الإشعارات
window.showNotify = function(message, type = "success") {
    console.log("🔔:", message);
    
    // عرض إشعار بسيط
    if (typeof alert !== 'undefined') {
        alert((type === "success" ? "✅ " : "❌ ") + message);
    }
    
    // أو إنشاء إشعار مرئي
    const notif = document.createElement("div");
    notif.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#10b981" : "#ef4444"};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
            ${type === "success" ? "✅" : "❌"} ${message}
        </div>
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
};

// 4. 🔐 إعادة تعيين كامل للمصادقة
window.hardResetAuth = function() {
    console.log("🔄 إعادة تعيين كاملة للمصادقة");
    
    // مسح جميع التخزين المحلي
    localStorage.clear();
    sessionStorage.clear();
    
    // تسجيل الخروج من Firebase
    if (auth) {
        auth.signOut().then(() => {
            console.log("✅ تم تسجيل الخروج");
            window.location.href = "index.html?reset=complete";
        });
    } else {
        window.location.href = "index.html?reset=complete";
    }
};

// 5. 🔐 الدخول بجوجل (مع تحسين)
window.signInWithGoogle = async function() {
    if (!initializeFirebase()) {
        showNotify("خطأ في النظام", "error");
        return;
    }
    
    try {
        // إعادة تعيين قبل الدخول
        await auth.signOut();
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // تأكد من إنشاء الملف
        const userRef = db.collection("users").doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                name: user.displayName || "مستخدم جديد",
                email: user.email,
                photoURL: user.photoURL || "",
                balance: 1000.00,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true
            });
        } else {
            await userRef.update({
                lastLogin: new Date().toISOString()
            });
        }
        
        showNotify(`مرحباً ${user.displayName || user.email}!`, "success");
        
        // الانتقال بعد 2 ثانية
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
        
    } catch (error) {
        console.error("Login error:", error);
        showNotify(`خطأ في الدخول: ${error.message}`, "error");
    }
};

// 6. 📊 تحميل بيانات المستخدم
window.loadUserData = async function() {
    if (!auth || !auth.currentUser) {
        console.log("❌ لا يوجد مستخدم مسجل");
        return null;
    }
    
    try {
        const user = auth.currentUser;
        const userDoc = await db.collection("users").doc(user.uid).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            console.log("📊 بيانات المستخدم:", data);
            return data;
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
    
    return null;
};

// 7. 🚪 تسجيل الخروج الآمن
window.logout = async function() {
    if (auth) {
        await auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    }
};

// 8. ⚡ نظام توجيه ذكي بدون حلقات
if (typeof window !== 'undefined' && !window.authListenerSet) {
    initializeFirebase();
    
    if (auth) {
        auth.onAuthStateChanged(async (user) => {
            console.log("🔄 تغيير حالة المصادقة:", user ? user.email : "لا يوجد مستخدم");
            
            const currentPage = window.location.pathname.split("/").pop();
            
            // منع التكرار
            if (window.authProcessing) return;
            window.authProcessing = true;
            
            setTimeout(() => {
                if (user) {
                    // تحقق من وجود الملف في Firestore
                    db.collection("users").doc(user.uid).get()
                        .then((doc) => {
                            if (doc.exists) {
                                // مستخدم حقيقي
                                if (currentPage === "index.html" || currentPage === "" || 
                                    currentPage === "login.html" || currentPage === "register.html") {
                                    console.log("➡️ توجيه مستخدم حقيقي إلى dashboard");
                                    window.location.href = "dashboard.html";
                                }
                            } else {
                                // مستخدم بدون ملف - إعادة تعيين
                                console.log("⚠️ مستخدم بدون ملف - إعادة تعيين");
                                auth.signOut();
                                localStorage.clear();
                                if (currentPage === "dashboard.html") {
                                    window.location.href = "index.html?error=no_profile";
                                }
                            }
                        })
                        .catch(() => {
                            console.log("❌ خطأ في التحقق");
                            if (currentPage === "dashboard.html") {
                                window.location.href = "index.html?error=auth_check_failed";
                            }
                        });
                } else {
                    // لا يوجد مستخدم
                    if (currentPage === "dashboard.html") {
                        console.log("⬅️ إعادة توجيه غير المسجل إلى الرئيسية");
                        window.location.href = "index.html";
                    }
                }
                
                // إعادة تعيين العلم بعد 3 ثوان
                setTimeout(() => {
                    window.authProcessing = false;
                }, 3000);
            }, 1000);
        });
        
        window.authListenerSet = true;
    }
}

// 9. 💰 وظيفة إرسال الأموال (عملية)
window.sendMoney = async function(toEmail, amount) {
    if (!auth || !auth.currentUser) {
        showNotify("يجب تسجيل الدخول أولاً", "error");
        return false;
    }
    
    try {
        const user = auth.currentUser;
        
        // البحث عن المستقبل
        const receiverQuery = await db.collection("users")
            .where("email", "==", toEmail)
            .get();
        
        if (receiverQuery.empty) {
            showNotify("المستخدم غير موجود", "error");
            return false;
        }
        
        const receiver = receiverQuery.docs[0];
        
        // استخدام Transaction
        await db.runTransaction(async (transaction) => {
            const senderRef = db.collection("users").doc(user.uid);
            const receiverRef = db.collection("users").doc(receiver.id);
            
            const senderDoc = await transaction.get(senderRef);
            const receiverDoc = await transaction.get(receiverRef);
            
            const senderBalance = senderDoc.data().balance || 0;
            const receiverBalance = receiverDoc.data().balance || 0;
            
            if (senderBalance < amount) {
                throw new Error("رصيدك غير كافٍ");
            }
            
            // تحديث الرصيد
            transaction.update(senderRef, { 
                balance: senderBalance - amount 
            });
            
            transaction.update(receiverRef, { 
                balance: receiverBalance + amount 
            });
            
            // تسجيل المعاملة
            transaction.set(db.collection("transactions").doc(), {
                from: user.email,
                to: toEmail,
                amount: amount,
                date: new Date().toLocaleString(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        showNotify(`تم تحويل ${amount} جنيه بنجاح!`, "success");
        return true;
        
    } catch (error) {
        console.error("Transfer error:", error);
        showNotify(`خطأ: ${error.message}`, "error");
        return false;
    }
};

console.log("🚀 Sudan Pay - النظام جاهز");
