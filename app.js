// 1. إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// 2. تهيئة الخدمات
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();

// 3. دالة الدخول بجوجل (مع إجبار الانتقال)
window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        console.log("تم الدخول بجوجل");
        window.location.replace("dashboard.html"); // تحويل إجباري
    }).catch(err => alert("خطأ جوجل: " + err.message));
};

// 4. دالة الدخول بالبريد
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        auth.signInWithEmailAndPassword(email, password).then(() => {
            window.location.replace("dashboard.html"); // تحويل إجباري
        }).catch(err => alert("بيانات الدخول غير صحيحة"));
    });
}

// 5. مراقب الحالة (Redirect Guard) - أهم جزء لحل مشكلة الثبات
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    if (user) {
        // لو المستخدم مسجل وهو في صفحة البداية أو اللوجن، حوله للداشبورد فوراً
        if (path.includes("index") || path.includes("login") || path.includes("register") || path.endsWith("/")) {
            window.location.replace("dashboard.html");
        }
    } else {
        // لو غير مسجل ويحاول دخول الداشبورد، أرجعه للوجن
        if (path.includes("dashboard") || path.includes("profile")) {
            window.location.replace("login.html");
        }
    }
});

// 6. تسجيل الخروج
window.logout = function() {
    auth.signOut().then(() => {
        window.location.replace("login.html");
    });
};
 
