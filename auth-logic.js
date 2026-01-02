import { auth, db, provider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, doc, setDoc, getDoc } from './app.js';

const authForm = document.getElementById('authForm');
const toggleAuth = document.getElementById('toggleAuth');
let isLogin = true;

// توليد ID Number فريد
const generateSPID = () => "SP-" + Math.floor(100000 + Math.random() * 900000);

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if (isLogin) {
        // تسجيل دخول
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => window.location.href = "dashboard.html")
            .catch(err => alert("خطأ: " + err.message));
    } else {
        // إنشاء حساب
        const name = document.getElementById('fullName').value;
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", cred.user.uid), {
                name: name,
                email: email,
                spID: generateSPID(),
                balanceSDG: 0,
                balanceUSDT: 0,
                uid: cred.user.uid
            });
            window.location.href = "dashboard.html";
        } catch (err) { alert(err.message); }
    }
});

// الدخول بقوقل
document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, provider).then(async (result) => {
        const user = result.user;
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (!docSnap.exists()) {
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                spID: generateSPID(),
                balanceSDG: 0,
                balanceUSDT: 0
            });
        }
        window.location.href = "dashboard.html";
    });
};

// نسيت كلمة المرور
document.getElementById('forgotPass').onclick = () => {
    const email = prompt("أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:");
    if (email) sendPasswordResetEmail(auth, email).then(() => alert("تم إرسال الرابط!"));
};

// تبديل بين دخول وتسجيل
toggleAuth.onclick = () => {
    isLogin = !isLogin;
    document.getElementById('fullName').style.display = isLogin ? "none" : "block";
    document.getElementById('authTitle').innerText = isLogin ? "تسجيل الدخول" : "إنشاء حساب";
    document.getElementById('submitBtn').innerText = isLogin ? "دخول" : "تسجيل";
};
