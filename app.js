import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// دالة لعرض التنبيهات
function showAlert(message, type = 'error') {
    // إزالة أي تنبيهات سابقة
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    alertDiv.innerHTML = `
        <div class="alert-content">
            <i class="fas ${icon}"></i>
            <div>
                <h4>${type === 'success' ? 'نجاح' : 'خطأ'}</h4>
                <p>${message}</p>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// إضافة أنماط التنبيهات
function addAlertStyles() {
    if (document.querySelector('.alert-styles')) return;
    
    const style = document.createElement('style');
    style.className = 'alert-styles';
    style.textContent = `
        .custom-alert {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            min-width: 300px;
            max-width: 500px;
            width: 90%;
            z-index: 9999;
            animation: slideDown 0.3s ease;
        }
        
        .alert-content {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border-radius: 10px;
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            gap: 15px;
        }
        
        .alert-success .alert-content {
            border-right: 4px solid #10b981;
        }
        
        .alert-error .alert-content {
            border-right: 4px solid #ef4444;
        }
        
        .alert-warning .alert-content {
            border-right: 4px solid #f59e0b;
        }
        
        .alert-success .fas {
            color: #10b981;
        }
        
        .alert-error .fas {
            color: #ef4444;
        }
        
        .alert-warning .fas {
            color: #f59e0b;
        }
        
        .alert-content h4 {
            margin: 0 0 5px 0;
            color: white;
            font-size: 1rem;
        }
        
        .alert-content p {
            margin: 0;
            color: #94a3b8;
            font-size: 0.9rem;
        }
        
        .alert-close {
            margin-right: auto;
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 1rem;
            padding: 5px;
        }
        
        @keyframes slideDown {
            from {
                transform: translate(-50%, -100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// تسجيل الدخول بالإيميل
async function loginWithEmail() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loginBtn = document.getElementById("login-btn");
    
    if (!email || !password) {
        showAlert("أدخل البريد الإلكتروني وكلمة المرور");
        return;
    }
    
    try {
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
        loginBtn.disabled = true;
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        showAlert("تم تسجيل الدخول بنجاح!", "success");
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
        
    } catch (error) {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
        loginBtn.disabled = false;
        
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
        
        switch(error.code) {
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
            case 'auth/user-not-found':
                errorMessage = 'البريد الإلكتروني غير مسجل';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/user-disabled':
                errorMessage = 'تم تعطيل هذا الحساب';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'محاولات كثيرة جداً، حاول لاحقاً';
                break;
            default:
                errorMessage = error.message;
        }
        
        showAlert(errorMessage);
        console.error('خطأ تسجيل الدخول:', error);
    }
}

// الدخول بجوجل
async function loginWithGoogle() {
    const googleBtn = document.getElementById("google-btn");
    
    try {
        const originalText = googleBtn.innerHTML;
        googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاتصال بجوجل...';
        googleBtn.disabled = true;
        
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // التحقق مما إذا كان المستخدم موجوداً في قاعدة البيانات
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                balance: 1000,
                photoURL: user.photoURL || '',
                createdAt: new Date().toISOString(),
                provider: 'google'
            });
        }
        
        showAlert("تم تسجيل الدخول بجوجل بنجاح!", "success");
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
        
    } catch (error) {
        googleBtn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20"> الدخول بجوجل';
        googleBtn.disabled = false;
        
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول بجوجل";
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'تم إغلاق نافذة تسجيل الدخول';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'تم إلغاء عملية تسجيل الدخول';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'هذا الحساب موجود بالفعل بمصادقة أخرى';
        }
        
        showAlert(errorMessage);
        console.error('خطأ جوجل:', error);
    }
}

// دالة تبديل رؤية كلمة المرور
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// تحميل التطبيق
function initApp() {
    addAlertStyles();
    
    // التحقق من حالة المصادقة
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('المستخدم مسجل بالفعل:', user.email);
        }
    });
    
    // ربط الأحداث
    document.addEventListener('DOMContentLoaded', () => {
        // ربط زر تسجيل الدخول
        const loginBtn = document.getElementById("login-btn");
        if (loginBtn) {
            loginBtn.addEventListener('click', loginWithEmail);
        }
        
        // ربط زر جوجل
        const googleBtn = document.getElementById("google-btn");
        if (googleBtn) {
            googleBtn.addEventListener('click', loginWithGoogle);
        }
        
        // ربط رابط إنشاء حساب جديد
        const signupLink = document.getElementById("signup-link");
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = "signup.html";
            });
        }
        
        // السماح بتسجيل الدخول بالضغط على Enter
        const passwordInput = document.getElementById("password");
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loginWithEmail();
                }
            });
        }
        
        // دالة تبديل كلمة المرور
        const toggleBtn = document.querySelector('.password-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', togglePassword);
        }
    });
}

// تهيئة التطبيق
initApp();

// جعل الدوال متاحة عالمياً
window.loginWithEmail = loginWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.togglePassword = togglePassword;
