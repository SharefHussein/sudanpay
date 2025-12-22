alert("app.js شغال 100%");
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB3XJUy_et-P80ek3013MRdC...",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "698090447272",
  appId: "1:698090447272:web:9013780e6dc6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        let msg = "حدث خطأ";
        if (error.code === "auth/user-not-found") msg = "الحساب غير موجود";
        if (error.code === "auth/wrong-password") msg = "كلمة المرور غير صحيحة";
        alert(msg);
      });
  });
}

// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        return cred.user.updateProfile({ displayName: fullname });
      })
      .then(() => {
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  });
}

// FORGOT PASSWORD
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail").value;

    auth.sendPasswordResetEmail(email)
      .then(() => {
        alert("تم إرسال رابط استعادة كلمة المرور");
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  });
                                          } 
