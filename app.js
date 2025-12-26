// تهيئة Firebase (v8)
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.firebasestorage.app",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// --- إضافة: دالة تسجيل الدخول بجوجل ---
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      console.error("Google Auth Error:", error);
      alert("حدث خطأ أثناء الدخول بجوجل");
    });
}

// --- كود تسجيل الدخول (الإيميل) القديم كما هو ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "جاري التحميل...";
    submitBtn.disabled = true;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => { window.location.href = 'dashboard.html'; })
      .catch((error) => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        let msg = 'حدث خطأ: ' + error.message;
        if (error.code === 'auth/user-not-found') msg = 'البريد الإلكتروني غير موجود';
        if (error.code === 'auth/wrong-password') msg = 'كلمة المرور غير صحيحة';
        alert(msg);
      });
  });
}

// --- كود إنشاء الحساب القديم كما هو ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        return userCredential.user.updateProfile({ displayName: fullName });
      })
      .then(() => { window.location.href = 'dashboard.html'; })
      .catch((error) => {
        alert('حدث خطأ أثناء التسجيل: ' + error.message);
      });
  });
}
 
