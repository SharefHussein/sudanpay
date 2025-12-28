// ============================================
// SUDAN PAY - التطبيق الكامل للدفع الرقمي
// ============================================

// 1. 🔐 إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
    authDomain: "sudanpay-e332a.firebaseapp.com",
    projectId: "sudanpay-e332a",
    storageBucket: "sudanpay-e332a.appspot.com",
    messagingSenderId: "699809447272",
    appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// 2. ⚡ تهيئة Firebase
let auth, db, appCheck;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("🔥 Firebase initialized");
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    
    // App Check (اختياري للتجربة)
    if (typeof firebase.appCheck !== 'undefined') {
        appCheck = firebase.appCheck();
        // Debug token للتطوير
        appCheck.activate('00000000-0000-4000-8000-000000000001', true);
    }
    
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
}

// 3. 🎨 نظام الإشعارات المتطور
window.showNotify = function(message, type = "success", duration = 4000) {
    const notif = document.createElement("div");
    const icon = type === "success" ? "✅" : "❌";
    
    notif.innerHTML = `
        <div class="fixed top-6 right-6 z-[9999] animate-slideIn">
            <div class="flex items-center p-4 rounded-2xl shadow-2xl min-w-[300px] max-w-md ${
                type === "success" 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                    : "bg-gradient-to-r from-red-500 to-rose-600"
            }">
                <div class="text-2xl mr-3">${icon}</div>
                <div class="flex-1 text-white font-bold">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white ml-3">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notif);
    
    // إضافة CSS للأنيميشن
    if (!document.querySelector('#notif-style')) {
        const style = document.createElement('style');
        style.id = 'notif-style';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .animate-slideIn { animation: slideIn 0.3s ease-out; }
        `;
        document.head.appendChild(style);
    }
    
    // إزالة التلقائية
    setTimeout(() => {
        if (notif.parentElement) {
            notif.style.animation = "slideIn 0.3s ease-out reverse";
            setTimeout(() => notif.remove(), 300);
        }
    }, duration);
};

// 4. 👤 إدارة المستخدمين
class UserManager {
    static async createUserProfile(user, additionalData = {}) {
        const userRef = db.collection("users").doc(user.uid);
        const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || additionalData.name || "مستخدم جديد",
            phone: additionalData.phone || "",
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=10b981&color=fff`,
            balance: 1000.00, // رصيد ترحيبي
            currency: "SDG",
            isActive: true,
            isVerified: user.emailVerified,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            settings: {
                notifications: true,
                twoFactor: false,
                language: "ar",
                theme: "dark"
            },
            statistics: {
                totalSent: 0,
                totalReceived: 0,
                transactionsCount: 0
            }
        };
        
        await userRef.set(userData, { merge: true });
        return userData;
    }
    
    static async getUserProfile(uid) {
        const doc = await db.collection("users").doc(uid).get();
        return doc.exists ? doc.data() : null;
    }
    
    static async updateProfile(uid, updates) {
        await db.collection("users").doc(uid).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

// 5. 🔐 نظام المصادقة
window.signInWithGoogle = async function() {
    if (!auth) {
        showNotify("النظام غير جاهز", "error");
        return;
    }
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // إنشاء/تحديث الملف
        await UserManager.createUserProfile(user);
        
        showNotify(`مرحباً ${user.displayName}! ✅`, "success");
        
        // تسجيل نشاط الدخول
        await db.collection("activity_logs").add({
            userId: user.uid,
            action: "login",
            method: "google",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent
        });
        
        // الانتقال بعد تأخير
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
        
    } catch (error) {
        console.error("Login error:", error);
        showNotify(`خطأ في الدخول: ${error.message}`, "error");
    }
};

window.signInWithEmail = async function(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        const user = result.user;
        
        showNotify("مرحباً بعودتك! ✅", "success");
        
        // تحديث آخر دخول
        await UserManager.updateProfile(user.uid, {
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
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
        
        // إنشاء الملف
        await UserManager.createUserProfile(user, { name, phone });
        
        // إرسال رسالة تأكيد البريد
        await user.sendEmailVerification();
        
        showNotify(`تم إنشاء حساب ${name} بنجاح! ✅ تحقق من بريدك`, "success");
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
        
    } catch (error) {
        showNotify(`خطأ: ${error.message}`, "error");
    }
};

// 6. 💰 نظام الدفع
class PaymentSystem {
    static async transferMoney(senderId, receiverEmail, amount, notes = "") {
        if (amount <= 0) throw new Error("المبلغ يجب أن يكون أكبر من الصفر");
        
        const senderRef = db.collection("users").doc(senderId);
        const receiverQuery = await db.collection("users").where("email", "==", receiverEmail).get();
        
        if (receiverQuery.empty) throw new Error("المستلم غير موجود");
        
        const receiverDoc = receiverQuery.docs[0];
        const receiverRef = receiverDoc.ref;
        const receiverData = receiverDoc.data();
        
        if (senderId === receiverDoc.id) throw new Error("لا يمكن التحويل لنفسك");
        
        return await db.runTransaction(async (transaction) => {
            const senderDoc = await transaction.get(senderRef);
            const receiverDoc = await transaction.get(receiverRef);
            
            const senderData = senderDoc.data();
            const receiverData2 = receiverDoc.data();
            
            // التحقق من الرصيد
            if (senderData.balance < amount) {
                throw new Error("رصيدك غير كافٍ لإتمام العملية");
            }
            
            // رسوم التحويل (1%)
            const fee = amount * 0.01;
            const totalDeduction = amount + fee;
            
            if (senderData.balance < totalDeduction) {
                throw new Error(`رصيدك غير كافٍ (يشمل الرسوم: ${fee.toFixed(2)} جنيه)`);
            }
            
            // تحديث الرصيد
            transaction.update(senderRef, {
                balance: senderData.balance - totalDeduction,
                "statistics.totalSent": (senderData.statistics?.totalSent || 0) + amount,
                "statistics.transactionsCount": (senderData.statistics?.transactionsCount || 0) + 1
            });
            
            transaction.update(receiverRef, {
                balance: (receiverData2.balance || 0) + amount,
                "statistics.totalReceived": (receiverData2.statistics?.totalReceived || 0) + amount,
                "statistics.transactionsCount": (receiverData2.statistics?.transactionsCount || 0) + 1
            });
            
            // تسجيل المعاملة
            const txRef = db.collection("transactions").doc();
            const txData = {
                id: txRef.id,
                fromId: senderId,
                fromEmail: senderData.email,
                fromName: senderData.name,
                toId: receiverDoc.id,
                toEmail: receiverEmail,
                toName: receiverData2.name,
                amount: amount,
                fee: fee,
                total: totalDeduction,
                currency: "SDG",
                status: "completed",
                notes: notes,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString()
            };
            
            transaction.set(txRef, txData);
            
            // إشعارات
            await this.sendNotification(receiverDoc.id, "استلام", `استلمت ${amount.toFixed(2)} جنيه من ${senderData.name}`);
            await this.sendNotification(senderId, "إرسال", `أرسلت ${amount.toFixed(2)} جنيه إلى ${receiverData2.name}`);
            
            return {
                success: true,
                transactionId: txRef.id,
                amount: amount,
                fee: fee,
                newBalance: senderData.balance - totalDeduction,
                receiverName: receiverData2.name
            };
        });
    }
    
    static async sendNotification(userId, type, message) {
        await db.collection("notifications").add({
            userId: userId,
            type: type,
            message: message,
            isRead: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    static async getTransactions(userId, limit = 20) {
        const snapshot = await db.collection("transactions")
            .where("participants", "array-contains", userId)
            .orderBy("timestamp", "desc")
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

// 7. 📊 واجهة API مبسطة
window.SudanPay = {
    // المستخدم
    getCurrentUser: () => auth?.currentUser,
    getUserProfile: async () => {
        const user = auth.currentUser;
        return user ? await UserManager.getUserProfile(user.uid) : null;
    },
    
    // الدفع
    sendMoney: async (toEmail, amount, notes = "") => {
        const user = auth.currentUser;
        if (!user) throw new Error("يجب تسجيل الدخول أولاً");
        
        try {
            const result = await PaymentSystem.transferMoney(user.uid, toEmail, amount, notes);
            showNotify(`تم التحويل بنجاح إلى ${result.receiverName} ✅`, "success");
            return result;
        } catch (error) {
            showNotify(error.message, "error");
            throw error;
        }
    },
    
    getBalance: async () => {
        const user = auth.currentUser;
        if (!user) return 0;
        
        const profile = await UserManager.getUserProfile(user.uid);
        return profile?.balance || 0;
    },
    
    getTransactions: async (limit = 10) => {
        const user = auth.currentUser;
        if (!user) return [];
        
        return await PaymentSystem.getTransactions(user.uid, limit);
    },
    
    // الإعدادات
    updateProfile: async (updates) => {
        const user = auth.currentUser;
        if (!user) throw new Error("يجب تسجيل الدخول أولاً");
        
        await UserManager.updateProfile(user.uid, updates);
        showNotify("تم تحديث الملف الشخصي ✅", "success");
    },
    
    changePassword: async (newPassword) => {
        const user = auth.currentUser;
        if (!user) throw new Error("يجب تسجيل الدخول أولاً");
        
        await user.updatePassword(newPassword);
        showNotify("تم تغيير كلمة المرور ✅", "success");
    },
    
    deleteAccount: async () => {
        const user = auth.currentUser;
        if (!user) throw new Error("يجب تسجيل الدخول أولاً");
        
        if (!confirm("⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك.")) {
            return;
        }
        
        // حذف البيانات أولاً
        await db.collection("users").doc(user.uid).delete();
        
        // حذف الحساب
        await user.delete();
        
        showNotify("تم حذف حسابك بنجاح", "success");
        setTimeout(() => window.location.href = "index.html", 1500);
    },
    
    // المساعدة
    logout: () => {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    }
};

// 8. 👁️ مراقبة حالة المصادقة
if (auth) {
    auth.onAuthStateChanged(async (user) => {
        const currentPage = window.location.pathname.split("/").pop();
        
        if (user) {
            console.log("✅ User signed in:", user.email);
            
            // إذا كان في الصفحة الرئيسية، اذهب للوحة التحكم
            if (currentPage === "index.html" || currentPage === "" || currentPage === "login.html" || currentPage === "register.html") {
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            }
            
            // تحديث آخر دخول
            if (currentPage === "dashboard.html") {
                try {
                    await UserManager.updateProfile(user.uid, {
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (error) {
                    console.error("Error updating last login:", error);
                }
            }
            
        } else {
            console.log("❌ No user signed in");
            
            // إذا كان في صفحة محمية، اذهب للرئيسية
            if (currentPage === "dashboard.html" || currentPage === "profile.html" || currentPage === "settings.html") {
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            }
        }
    });
}

// 9. 🛠️ وظائف مساعدة
window.formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SD', {
        style: 'currency',
        currency: 'SDG',
        minimumFractionDigits: 2
    }).format(amount);
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

// 10. 📱 دعم PWA
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

console.log("🚀 Sudan Pay App Loaded Successfully!"); 
