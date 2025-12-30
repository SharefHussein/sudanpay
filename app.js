// إعدادات Firebase - سيتم استبدال القيم تلقائياً بواسطة GitHub Actions
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc,",
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

