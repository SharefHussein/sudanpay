// auth.js (الإصدار المتوافق مع v8)

const db = firebase.firestore(); // تعريف قاعدة البيانات

// =======================
// Register (إنشاء حساب مع إنشاء محفظة)
// =======================
window.register = function () {
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password || !fullName) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      // 1. تحديث اسم المستخدم
      return cred.user.updateProfile({ displayName: fullName }).then(() => cred);
    })
    .then((cred) => {
      // 2. إنشاء مستند للمستخدم في Firestore (المحفظة)
      return db.collection("users").doc(cred.user.uid).set({
        fullName: fullName,
        email: email,
        balance: 0, // الرصيد الافتتاحي
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("خطأ في التسجيل: " + error.message);
    });
};

// =======================
// Login (تسجيل دخول)
// =======================
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("خطأ في الدخول: " + error.message);
    });
};

// =======================
// حماية الصفحات وجلب البيانات
// =======================
firebase.auth().onAuthStateChanged((user) => {
  const path = window.location.pathname;

  // إذا حاول دخول الداشبورد وهو غير مسجل
  if (!user && (path.includes("dashboard") || path.includes("statement") || path.includes("profile"))) {
    window.location.href = "login.html";
    return;
  }

  // إذا كان مسجل دخول، نقوم بجلب الرصيد من Firestore
  if (user) {
    db.collection("users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        
        // تحديث الرصيد في أي صفحة تحتوي على عنصر بمعرف balance
        const balanceEl = document.getElementById("balance");
        if (balanceEl) {
            balanceEl.innerText = data.balance.toLocaleString() + " SDG";
        }
        
        // تحديث الاسم في البروفايل أو الداشبورد
        const nameEl = document.getElementById("user-display-name");
        if (nameEl) nameEl.innerText = data.fullName;
      }
    });
  }
});
 
