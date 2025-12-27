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
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();

// 2. دالة الدخول بجوجل (لا تعمل إلا بالضغط)
window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        // الانتقال فقط بعد نجاح العملية
        window.location.replace("dashboard.html");
    }).catch(err => {
        if(err.code !== 'auth/popup-closed-by-user') alert("خطأ جوجل: " + err.message);
    });
};

// 3. دالة الدخول بالبريد (لا تعمل إلا بالضغط على الزر)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button');
        
        btn.disabled = true; // منع الضغط المتكرر
        btn.innerText = "جاري التحقق...";

        auth.signInWithEmailAndPassword(email, password).then(() => {
            window.location.replace("dashboard.html");
        }).catch(err => {
            btn.disabled = false;
            btn.innerText = "تسجيل الدخول";
            alert("بيانات الدخول غير صحيحة");
        });
    });
}

// 4. دالة إنشاء الحساب (Register)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button');

        btn.disabled = true;
        
        auth.createUserWithEmailAndPassword(email, password).then((cred) => {
            return cred.user.updateProfile({ displayName: fullName }).then(() => cred);
        }).then((cred) => {
            return db.collection("users").doc(cred.user.uid).set({
                fullName: fullName,
                email: email,
                balance: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }).then(() => {
            window.location.replace("dashboard.html");
        }).catch(err => {
            btn.disabled = false;
            alert(err.message);
        });
    });
}

// 5. حماية الصفحات فقط (بدون تحويل تلقائي للداخل)
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    // إذا كنت غير مسجل وتحاول دخول الداشبورد، نرجعك للوجن
    if (!user && (path.includes("dashboard") || path.includes("profile"))) {
        window.location.replace("login.html");
    }
});

// 6. دالة تسجيل الخروج
window.logout = function() {
    auth.signOut().then(() => {
        window.location.replace("login.html");
    });
};
 
