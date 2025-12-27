// ============================================
// SUDANPAY - تطبيق الدفع الرقمي
// ============================================

// 1. 🔒 إعدادات Firebase (ضع مفاتيحك الحقيقية هنا)
const firebaseConfig = {
    apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
    authDomain: "sudanpay-e332a.firebaseapp.com",
    projectId: "sudanpay-e332a",
    storageBucket: "sudanpay-e332a.appspot.com",
    messagingSenderId: "699809447272",
    appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const appCheck = firebase.appCheck();
appCheck.activate('A9ECD854-8B88-472C-BC28-A38741F20C03');

// 2. 🔔 نظام التنبيهات الذكي
window.showNotify = function(message, type = "success") {
    const notif = document.createElement("div");
    notif.style.cssText = `
        position: fixed; top: 25px; left: 50%; transform: translateX(-50%) translateY(-120%);
        padding: 16px 32px; border-radius: 24px; z-index: 10000; font-size: 14px; font-weight: 900;
        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        display: flex; align-items: center; gap: 10px; min-width: 280px; justify-content: center;
        pointer-events: none;
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

// 3. 🔐 وظائف المصادقة
// الدخول بحساب Google
window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // إنشاء أو تحديث بيانات المستخدم في Firestore
            const user = result.user;
            const userRef = db.collection("users").doc(user.uid);
            userRef.set({
                name: user.displayName || "مستخدم جديد",
                email: user.email,
                photoURL: user.photoURL || "",
                balance: 1000.00, // رصيد ترحيبي
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            showNotify(`مرحباً ${user.displayName || user.email}! ✅`, "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        })
        .catch((error) => {
            console.error("خطأ في الدخول:", error);
            showNotify("فشل الدخول: " + error.message, "error");
        });
};

// الدخول بالإيميل (لصفحة login.html)
window.signInWithEmail = function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
        showNotify("يرجى ملء جميع الحقول", "error");
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showNotify("تم الدخول بنجاح ✅", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        })
        .catch((error) => {
            showNotify("خطأ: " + error.message, "error");
        });
};

// التسجيل بحساب جديد (لصفحة register.html)
window.registerWithEmail = function() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    
    if (!name || !email || !password) {
        showNotify("يرجى ملء جميع الحقول", "error");
        return;
    }
    
    if (password !== confirmPassword) {
        showNotify("كلمتا المرور غير متطابقتين", "error");
        return;
    }
    
    if (password.length < 6) {
        showNotify("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // إنشاء بيانات المستخدم في Firestore
            db.collection("users").doc(user.uid).set({
                name: name,
                email: email,
                balance: 1000.00, // رصيد ترحيبي
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showNotify(`تم إنشاء حساب ${name} بنجاح! ✅`, "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        })
        .catch((error) => {
            showNotify("خطأ: " + error.message, "error");
        });
};

// 4. 💰 وظائف المال والمعاملات
// تحميل بيانات المستخدم والرصيد
window.loadUserData = async function() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    
    try {
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // تحديث واجهة Dashboard
            document.getElementById("userName").textContent = userData.name || user.email;
            document.getElementById("userEmail").textContent = user.email;
            document.getElementById("userBalance").textContent = `${userData.balance?.toFixed(2) || "0.00"} جنيه`;
            
            // صورة المستخدم
            const userPhoto = document.getElementById("userPhoto");
            if (userData.photoURL) {
                userPhoto.src = userData.photoURL;
                userPhoto.style.display = "block";
            }
        }
    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
    }
};

// إرسال الأموال
window.sendMoney = async function() {
    const toEmail = document.getElementById("toEmail").value.trim();
    const amountInput = document.getElementById("amount");
    const amount = Number(amountInput.value);
    const sender = auth.currentUser;
    
    if (!toEmail || amount <= 0) {
        showNotify("أدخل بيانات صحيحة", "error");
        return;
    }
    
    // لا يمكن إرسال أموال لنفسك
    if (toEmail.toLowerCase() === sender.email.toLowerCase()) {
        showNotify("لا يمكن إرسال الأموال لنفسك", "error");
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
        const receiverId = receiverDoc.id;
        
        // استخدام Transaction لضمان السلامة
        await db.runTransaction(async (transaction) => {
            const senderRef = db.collection("users").doc(sender.uid);
            const receiverRef = db.collection("users").doc(receiverId);
            
            const senderDoc = await transaction.get(senderRef);
            const receiverDoc = await transaction.get(receiverRef);
            
            const senderBalance = senderDoc.data().balance || 0;
            const receiverBalance = receiverDoc.data().balance || 0;
            
            // التحقق من الرصيد الكافي
            if (senderBalance < amount) {
                throw new Error("رصيدك غير كافٍ لإتمام العملية");
            }
            
            // تحديث الرصيد
            transaction.update(senderRef, { balance: senderBalance - amount });
            transaction.update(receiverRef, { balance: receiverBalance + amount });
            
            // تسجيل المعاملة
            const txRef = db.collection("transactions").doc();
            transaction.set(txRef, {
                fromId: sender.uid,
                fromEmail: sender.email,
                toId: receiverId,
                toEmail: toEmail,
                amount: amount,
                status: "completed",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        showNotify(`تم تحويل ${amount.toFixed(2)} جنيه بنجاح ✅`, "success");
        
        // تحديث الرصيد في الواجهة
        setTimeout(() => {
            loadUserData(); // إعادة تحميل البيانات
            document.getElementById("toEmail").value = "";
            amountInput.value = "";
        }, 1000);
        
    } catch (error) {
        showNotify(error.message, "error");
    }
};

// 5. ⚙️ وظائف الإعدادات
// تغيير كلمة المرور
window.changePassword = function() {
    const user = auth.currentUser;
    if (!user) return;
    
    const newPassword = prompt("أدخل كلمة المرور الجديدة (6 أحرف على الأقل):");
    if (!newPassword || newPassword.length < 6) {
        showNotify("كلمة المرور ضعيفة جداً", "error");
        return;
    }
    
    user.updatePassword(newPassword).then(() => {
        showNotify("تم تغيير كلمة المرور بنجاح ✅", "success");
    }).catch((error) => {
        if (error.code === "auth/requires-recent-login") {
            showNotify("للأمان، يرجى إعادة تسجيل الدخول أولاً", "error");
        } else {
            showNotify("خطأ: " + error.message, "error");
        }
    });
};

// تحديث البيانات الشخصية
window.updateUserData = function() {
    const user = auth.currentUser;
    if (!user) return;
    
    const newName = prompt("أدخل الاسم الجديد:", user.displayName || "");
    const newPhone = prompt("أدخل رقم الهاتف الجديد:", "");
    
    if (newName || newPhone) {
        const updates = {};
        if (newName) updates.name = newName;
        if (newPhone) updates.phone = newPhone;
        
        // تحديث في Firestore
        db.collection("users").doc(user.uid).update(updates)
            .then(() => {
                showNotify("تم تحديث البيانات بنجاح ✅", "success");
                setTimeout(() => location.reload(), 1500);
            })
            .catch((err) => {
                showNotify("فشل التحديث: " + err.message, "error");
            });
    }
};

// حذف الحساب (مع التحذير)
window.deleteAccount = function() {
    if (!confirm("⚠️ تحذير: هل أنت متأكد من حذف حسابك؟\n\nهذا الإجراء:\n• سيمسح جميع بياناتك\n• سيفقد رصيدك\n• لا يمكن التراجع عنه")) {
        return;
    }
    
    const user = auth.currentUser;
    if (!user) return;
    
    // حذف بيانات المستخدم أولاً
    db.collection("users").doc(user.uid).delete()
        .then(() => {
            // حذف حساب المصادقة
            return user.delete();
        })
        .then(() => {
            showNotify("تم حذف حسابك بنجاح", "success");
            setTimeout(() => {
                window.location.replace("index.html");
            }, 1500);
        })
        .catch((error) => {
            if (error.code === "auth/requires-recent-login") {
                showNotify("للأمان، يرجى إعادة تسجيل الدخول أولاً", "error");
            } else {
                showNotify("خطأ في الحذف: " + error.message, "error");
            }
        });
};

// 6. 🚪 تسجيل الخروج
window.logout = function() {
    auth.signOut().then(() => {
        window.location.replace("index.html");
    });
};

// 7. 🔍 مراقبة حالة المصادقة
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split("/").pop();
    
    if (user && (currentPage === "index.html" || currentPage === "")) {
        // إذا كان مسجل دخول وهو في الصفحة الرئيسية، انتقل للـ Dashboard
        window.location.href = "dashboard.html";
    } else if (!user && (currentPage === "dashboard.html" || currentPage === "profile.html")) {
        // إذا لم يكن مسجل دخول وهو في صفحات تحتاج تسجيل، ارجع للرئيسية
        window.location.href = "index.html";
    }
}); 
