// 1. إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.firebasestorage.app",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// تهيئة التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 2. دالة تسجيل الدخول بجوجل
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      console.error("Google Auth Error:", error);
      alert("عذراً، حدث خطأ أثناء الدخول بواسطة جوجل.");
    });
}

// 3. معالجة تسجيل الدخول (Email & Password)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    
    // تحويل الزر لحالة التحميل
    toggleLoading(submitBtn, true);

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => { 
          window.location.href = 'dashboard.html'; 
      })
      .catch((error) => {
        toggleLoading(submitBtn, false);
        handleErrors(error);
      });
  });
}

// 4. معالجة إنشاء الحساب الجديد
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    toggleLoading(submitBtn, true);

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // تحديث اسم المستخدم في Firebase
        return userCredential.user.updateProfile({ displayName: fullName });
      })
      .then(() => { 
          window.location.href = 'dashboard.html'; 
      })
      .catch((error) => {
        toggleLoading(submitBtn, false);
        handleErrors(error);
      });
  });
}

// 5. دوال مساعدة (Helper Functions) لتحسين تجربة المستخدم

// دالة التحكم في حالة الأزرار أثناء التحميل
function toggleLoading(btn, isLoading) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin ml-2"></i> جاري التحميل...`;
        btn.style.opacity = "0.7";
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.id === 'registerForm' ? "إنشاء حساب مجاني" : "تسجيل الدخول";
        btn.style.opacity = "1";
    }
}

// دالة عرض الأخطاء بشكل مفهوم باللغة العربية
function handleErrors(error) {
    let message = "حدث خطأ غير متوقع، حاول مرة أخرى.";
    switch (error.code) {
        case 'auth/user-not-found':
            message = "البريد الإلكتروني غير مسجل لدينا.";
            break;
        case 'auth/wrong-password':
            message = "كلمة المرور التي أدخلتها غير صحيحة.";
            break;
        case 'auth/email-already-in-use':
            message = "هذا البريد الإلكتروني مسجل بالفعل.";
            break;
        case 'auth/weak-password':
            message = "كلمة المرور ضعيفة جداً، اختر كلمة أقوى.";
            break;
        case 'auth/invalid-email':
            message = "صيغة البريد الإلكتروني غير صحيحة.";
            break;
    }
    alert(message);
}

// 6. تحديث بيانات المستخدم في الصفحات (اختياري)
auth.onAuthStateChanged((user) => {
    if (user) {
        // إذا كان المستخدم في صفحة البروفايل أو الداشبورد، نحدث اسمه
        const nameElement = document.getElementById('user-display-name');
        const emailElement = document.getElementById('user-display-email');
        if (nameElement) nameElement.innerText = user.displayName || "مستخدم سودان باي";
        if (emailElement) emailElement.innerText = user.email;
    }
});
 
