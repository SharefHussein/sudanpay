// تهيئة Firebase (v8)
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.firebasestorage.app",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// تأكد من أن Firebase تم تحميله
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// تسجيل الدخول
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // تغيير نص الزرار عشان المستخدم يعرف إنه في عملية جارية
    const submitBtn = e.target.querySelector('button');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "جاري التحميل...";
    submitBtn.disabled = true;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        alert('تم تسجيل الدخول بنجاح!');
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        console.error("Login Error:", error); // مهم جداً لمراقبة الخطأ
        
        let msg = 'حدث خطأ: ' + error.message;
        if (error.code === 'auth/user-not-found') msg = 'البريد الإلكتروني غير موجود';
        if (error.code === 'auth/wrong-password') msg = 'كلمة المرور غير صحيحة';
        alert(msg);
      });
  });
}

// إنشاء حساب
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
        // تحديث الاسم بشكل أكثر أماناً
        return userCredential.user.updateProfile({ displayName: fullName });
      })
      .then(() => {
          alert('تم إنشاء الحساب بنجاح!');
          window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        console.error("Register Error:", error);
        let msg = 'حدث خطأ أثناء التسجيل';
        if (error.code === 'auth/email-already-in-use') msg = 'البريد الإلكتروني مستخدم';
        if (error.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة جدًا (6 أرقام على الأقل)';
        alert(msg);
      });
  });
}
