import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.firebasestorage.app",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add",
  measurementId: "G-XRN6CBLKXY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // المستخدم مسجل دخول → اظهر الداشبورد
        document.getElementById('authPage').classList.add('hidden-section');
        document.getElementById('dashboardPage').classList.remove('hidden-section');
        
        // تحديث الاسم في الداشبورد لو موجود
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.innerText = user.displayName || "مستخدم سودان باي";
        }
        
        // اظهر القسم الرئيسي
        showSection('dashboard');
    } else {
        // مفيش مستخدم → اظهر صفحة الدخول
        document.getElementById('authPage').classList.remove('hidden-section');
        document.getElementById('dashboardPage').classList.add('hidden-section');
    }
});

window.loginEmail = () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    if (!email || !pass) {
        alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
        return;
    }
    signInWithEmailAndPassword(auth, email, pass)
        .catch((error) => {
            alert("خطأ في الدخول: " + error.message);
        });
};

window.loginWithGoogle = () => {
    signInWithPopup(auth, provider)
        .catch((error) => {
            alert("خطأ في الدخول بجوجل: " + error.message);
        });
};

window.logout = () => {
    signOut(auth).then(() => {
        alert("تم تسجيل الخروج بنجاح");
    });
};

window.showSection = (id) => {
    const sections = ['dashboard', 'transactions', 'payments', 'reports', 'settings'];
    sections.forEach(s => {
        const el = document.getElementById(s + 'Section');
        if (el) el.classList.add('hidden-section');
    });
    const target = document.getElementById(id + 'Section');
    if (target) target.classList.remove('hidden-section');
};
