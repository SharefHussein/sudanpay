// إعدادات Firebase - سيقوم GitHub بوضع المفاتيح الحقيقية هنا تلقائياً
const firebaseConfig = {
  apiKey: "GITHUB_SECRET_API_KEY",
  authDomain: "GITHUB_SECRET_AUTH_DOMAIN",
  projectId: "GITHUB_SECRET_PROJECT_ID",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// وظيفة تسجيل الدخول
window.login = function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("الرجاء إدخال البيانات");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = "dashboard.html")
        .catch((error) => alert("خطأ: " + error.message));
};

// وظيفة الدخول بجوجل
window.loginWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => window.location.href = "dashboard.html")
        .catch((error) => alert("خطأ جوجل: " + error.message));
};

