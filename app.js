// إعدادات Firebase - سيتم استبدال القيم تلقائياً بواسطة GitHub Actions
const firebaseConfig = {
  apiKey: "REPLACE_WITH_API_KEY",
  authDomain: "REPLACE_WITH_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_PROJECT_ID",
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

// دالة تسجيل الدخول بالبريد
window.login = function() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value;
    
    if(!email || !pass) return alert("الرجاء إدخال البيانات");

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => window.location.href = "dashboard.html")
        .catch(err => alert("خطأ: " + err.message));
};

// دالة الدخول بجوجل
window.loginWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => window.location.href = "dashboard.html")
        .catch(err => alert("خطأ جوجل: " + err.message));
};

