// ============================================
// SUDAN PAY - نسخة مبسطة 100% تعمل
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

// تهيئة فورية
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized");
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("✅ النظام جاهز");
}

// 3. 🔔 إشعارات بسيطة
window.showAlert = function(message, type = "success") {
    if (typeof alert !== 'undefined') {
        alert((type === "success" ? "✅ " : "❌ ") + message);
    }
    console.log("🔔:", message);
};

// 4. 🔐 الدخول بجوجل - نسخة مبسطة تعمل
window.signInWithGoogle = async function() {
    console.log("🔐 محاولة الدخول بجوجل...");
    
    // تأكد من تحميل Firebase
    if (typeof firebase === 'undefined') {
        showAlert("جاري تحميل النظام...", "error");
        return;
    }
    
    try {
        // إعادة تهيئة للتحقق
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // إضافة نطاق للصلاحيات
        provider.addScope('email');
        provider.addScope('profile');
        
        // الدخول
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log("✅ تم الدخول:", user.email);
        showAlert(`مرحباً ${user.displayName || user.email}!`, "success");
        
        // إنشاء/تحديث ملف المستخدم في Firestore
        const db = firebase.firestore();
        const userRef = db.collection("users").doc(user.uid);
        
        await userRef.set({
            name: user.displayName || "مستخدم جديد",
            email: user.email,
            photoURL: user.photoURL || "",
            balance: 1000.00,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true
        }, { merge: true });
        
        console.log("✅ تم حفظ بيانات المستخدم");
        
        // الانتقال بعد ثانيتين
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
        
    } catch (error) {
        console.error("❌ خطأ في الدخول:", error);
        
        // رسائل خطأ واضحة
        let errorMessage = "حدث خطأ غير معروف";
        
        if (error.code === 'auth/popup-blocked') {
            errorMessage = "تم منع النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.";
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "تم إغلاق نافذة الدخول. يرجى المحاولة مرة أخرى.";
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = "خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert("خطأ في الدخول: " + errorMessage, "error");
    }
};

// 5. 📊 تحميل بيانات المستخدم للوحة التحكم
window.loadUserData = async function() {
    console.log("📊 محاولة تحميل بيانات المستخدم...");
    
    if (typeof firebase === 'undefined') {
        console.log("❌ Firebase غير محمل");
        return null;
    }
    
    const auth = firebase.auth();
    const user = auth.currentUser;
    
    if (!user) {
        console.log("❌ لا يوجد مستخدم مسجل");
        return null;
    }
    
    try {
        const db = firebase.firestore();
        const userDoc = await db.collection("users").doc(user.uid).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            console.log("✅ بيانات المستخدم:", data);
            
            // تحديث واجهة لوحة التحكم
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
            
            return data;
        } else {
            console.log("⚠️ ملف المستخدم غير موجود");
            return null;
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل البيانات:", error);
        return null;
    }
};

// 6. 💰 إرسال الأموال
window.sendMoney = async function() {
    console.log("💰 محاولة إرسال أموال...");
    
    if (typeof firebase === 'undefined') {
        showAlert("النظام غير جاهز", "error");
        return;
    }
    
    const auth = firebase.auth();
    const user = auth.currentUser;
    
    if (!user) {
        showAlert("يجب تسجيل الدخول أولاً", "error");
        return;
    }
    
    const toEmail = document.getElementById("toEmail")?.value.trim();
    const amountInput = document.getElementById("amount")?.value;
    const amount = parseFloat(amountInput);
    
    if (!toEmail || !amount || amount <= 0) {
        showAlert("يرجى إدخال بيانات صحيحة", "error");
        return;
    }
    
    try {
        const db = firebase.firestore();
        
        // البحث عن المستقبل
        const receiverQuery = await db.collection("users")
            .where("email", "==", toEmail)
            .get();
        
        if (receiverQuery.empty) {
            showAlert("المستخدم غير موجود", "error");
            return;
        }
        
        const receiverDoc = receiverQuery.docs[0];
        
        // معالجة التحويل
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
                date: new Date().toLocaleString(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        showAlert(`تم تحويل ${amount.toFixed(2)} جنيه بنجاح!`, "success");
        
        // تحديث الرصيد
        setTimeout(() => {
            loadUserData();
            if (document.getElementById("toEmail")) {
                document.getElementById("toEmail").value = "";
            }
            if (document.getElementById("amount")) {
                document.getElementById("amount").value = "";
            }
        }, 1000);
        
    } catch (error) {
        console.error("❌ خطأ في التحويل:", error);
        showAlert("خطأ: " + error.message, "error");
    }
};

// 7. 🚪 تسجيل الخروج
window.logout = async function() {
    console.log("🚪 محاولة تسجيل الخروج...");
    
    if (typeof firebase !== 'undefined') {
        try {
            await firebase.auth().signOut();
            console.log("✅ تم تسجيل الخروج");
        } catch (error) {
            console.error("❌ خطأ في تسجيل الخروج:", error);
        }
    }
    
    // مسح التخزين المحلي
    localStorage.clear();
    sessionStorage.clear();
    
    // الانتقال للرئيسية
    window.location.href = "index.html";
};

// 8. 🔄 نظام تحكم بسيط في التوجيه
if (typeof window !== 'undefined' && typeof firebase !== 'undefined') {
    const auth = firebase.auth();
    
    auth.onAuthStateChanged((user) => {
        console.log("🔄 تغيير حالة المصادقة:", user ? user.email : "لا يوجد مستخدم");
        
        const currentPage = window.location.pathname.split("/").pop();
        
        // تأخير 2 ثانية قبل أي إجراء
        setTimeout(() => {
            if (user) {
                // إذا كان مسجلاً وهو في الصفحات العامة
                if (currentPage === "index.html" || currentPage === "" || 
                    currentPage === "login.html" || currentPage === "register.html") {
                    
                    console.log("➡️ توجيه إلى dashboard");
                    window.location.href = "dashboard.html";
                }
            } else {
                // إذا لم يكن مسجلاً وهو في dashboard
                if (currentPage === "dashboard.html") {
                    console.log("⬅️ إعادة توجيه إلى الرئيسية");
                    window.location.href = "index.html";
                }
            }
        }, 2000);
    });
}

console.log("🚀 Sudan Pay - النظام جاهز للعمل");
