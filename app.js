import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// هتتغير تلقائياً بالـ GitHub Actions
const firebaseConfig = {
    apiKey: "REPLACE_WITH_API_KEY",
    authDomain: "REPLACE_WITH_AUTH_DOMAIN",
    projectId: "REPLACE_WITH_PROJECT_ID",
    storageBucket: "sudanpay-e332a.appspot.com",
    messagingSenderId: "699809447272",
    appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('authPage').classList.add('hidden-section');
        document.getElementById('dashboardPage').classList.remove('hidden-section');
        document.getElementById('userName').innerText = user.displayName || "مستخدم";
        showSection('dashboard');
    } else {
        document.getElementById('authPage').classList.remove('hidden-section');
        document.getElementById('dashboardPage').classList.add('hidden-section');
    }
});

window.loginEmail = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("خطأ: " + e.message));
};

window.loginWithGoogle = () => signInWithPopup(auth, provider);

window.logout = () => signOut(auth);

window.showSection = (id) => {
    document.querySelectorAll('[id$="Section"]').forEach(sec => sec.classList.add('hidden-section'));
    document.getElementById(id + 'Section').classList.remove('hidden-section');
};
