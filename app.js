// ==========================================
// 1. إعدادات وتجهيز Firebase
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// تهيئة التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// 2. إدارة المستخدمين (التسجيل والدخول)
// ==========================================

// --- إنشاء حساب جديد ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button');

        toggleLoading(submitBtn, true);

        auth.createUserWithEmailAndPassword(email, password)
            .then((cred) => {
                // تحديث اسم المستخدم في Auth
                return cred.user.updateProfile({ displayName: fullName }).then(() => cred);
            })
            .then((cred) => {
                // إنشاء محفظة (Wallet) في Firestore بالرصيد صفر
                return db.collection("users").doc(cred.user.uid).set({
                    fullName: fullName,
                    email: email,
                    balance: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((err) => {
                toggleLoading(submitBtn, false);
                alert("خطأ في التسجيل: " + err.message);
            });
    });
}

// --- تسجيل الدخول بالإيميل ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button');

        toggleLoading(submitBtn, true);

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = 'dashboard.html';
            })
            .catch((err) => {
                toggleLoading(submitBtn, false);
                alert("بيانات الدخول غير صحيحة");
            });
    });
}

// --- الدخول بجوجل ---
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // التحقق إذا كان المستخدم جديداً لإنشاء محفظة له
            const user = result.user;
            const docRef = db.collection("users").doc(user.uid);
            
            docRef.get().then((doc) => {
                if (!doc.exists) {
                    docRef.set({
                        fullName: user.displayName,
                        email: user.email,
                        balance: 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                window.location.href = 'dashboard.html';
            });
        })
        .catch((err) => alert(err.message));
}

// ==========================================
// 3. مراقبة حالة المستخدم وجلب الرصيد
// ==========================================

auth.onAuthStateChanged((user) => {
    if (user) {
        // نحن في صفحة محمية (مثل الداشبورد)
        db.collection("users").doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // تحديث الرصيد في أي مكان يحتوي على id="balance"
                const balanceEl = document.getElementById('balance');
                if (balanceEl) balanceEl.innerText = userData.balance.toLocaleString() + " جنيه";

                // تحديث الاسم
                const nameEl = document.getElementById('user-display-name');
                if (nameEl) nameEl.innerText = userData.fullName;
            }
        });
    } else {
        // إذا لم يكن مسجلاً وهو في صفحة محمية، أرجعه للوجن
        const path = window.location.pathname;
        if (path.includes("dashboard") || path.includes("profile") || path.includes("statement")) {
            window.location.href = "login.html";
        }
    }
});

// ==========================================
// 4. وظائف عامة (UI Helpers)
// ==========================================

function toggleLoading(btn, isLoading) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.closest('form').id === 'registerForm' ? "إنشاء حساب" : "تسجيل الدخول";
    }
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
