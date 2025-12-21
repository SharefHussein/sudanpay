// تهيئة Firebase (الكونفيج بتاعك)
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.firebasestorage.app",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// تسجيل الدخول (Login)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        alert('تم تسجيل الدخول بنجاح!');
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        let msg = 'حدث خطأ، حاول مرة أخرى';
        if (error.code === 'auth/user-not-found') msg = 'البريد الإلكتروني غير موجود';
        if (error.code === 'auth/wrong-password') msg = 'كلمة المرور غير صحيحة';
        alert(msg);
      });
  });
}

// إنشاء حساب (Register)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;

    if (!fullName || !email || !phone || !password) {
      alert('املأ كل الحقول من فضلك');
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        user.updateProfile({ displayName: fullName })
          .then(() => {
            alert('تم إنشاء الحساب بنجاح!');
            window.location.href = 'dashboard.html';
          });
      })
      .catch((error) => {
        let msg = 'حدث خطأ أثناء التسجيل';
        if (error.code === 'auth/email-already-in-use') msg = 'البريد الإلكتروني مستخدم بالفعل';
        if (error.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة جدًا';
        alert(msg);
      });
  });
}

// استعادة كلمة المرور (Forgot Password)
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();

    auth.sendPasswordResetEmail(email)
      .then(() => {
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!');
        window.location.href = 'login.html';
      })
      .catch((error) => {
        alert('حدث خطأ: ' + error.message);
      });
  });
      }
