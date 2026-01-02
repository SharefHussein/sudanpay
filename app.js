import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

// تسجيل الدخول بالإيميل
document.getElementById("login-btn").onclick = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) {
    alert("أدخل البريد وكلمة المرور");
    return;
  }
  signInWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(e => alert("خطأ: " + e.message));
};

// الدخول بجوجل
document.getElementById("google-btn").onclick = () => {
  signInWithPopup(auth, provider)
    .then(() => window.location.href = "dashboard.html")
    .catch(e => alert("خطأ في الدخول بجوجل: " + e.message));
};

// إنشاء حساب (لو عايز زر منفصل)
document.getElementById("signup-link").onclick = (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) {
    alert("أدخل البريد وكلمة المرور");
    return;
  }
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("تم إنشاء الحساب!");
      window.location.href = "dashboard.html";
    })
    .catch(e => alert("خطأ: " + e.message));
};
