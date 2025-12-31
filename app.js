// إعدادات Firebase - سيتم استبدال القيم تلقائياً بواسطة GitHub Actions
const firebaseConfig = {
  apiKey: "REPLACE_WITH_API_KEY",
  authDomain: "REPLACE_WITH_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// إدارة حالة التطبيق
let currentUser = null;

// وظيفة عرض التنبيهات (مُصَحَّحة)
function showAlert(title, message, type) {
    // إزالة أي تنبيهات سابقة
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    
    // اختيار الأيقونة المناسبة
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    alertDiv.innerHTML = `
        <div class="alert-content">
            <i class="fas ${icon}"></i>
            <div>
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // إزالة التنبيه بعد 5 ثواني
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// إضافة أنماط التنبيهات تلقائياً
function addAlertStyles() {
    const style = document.createElement('style');
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
        
        .alert-info .alert-content {
            border-right: 4px solid #3b82f6;
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
        
        .alert-info .fas {
            color: #3b82f6;
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

// تهيئة التطبيق
function initApp() {
    addAlertStyles(); // إضافة أنماط التنبيهات
    renderLoginPage();
    setupAuthListener();
}

// عرض صفحة تسجيل الدخول
function renderLoginPage() {
    document.getElementById('app').innerHTML = `
        <div id="loginPage" class="auth-page">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-logo">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <h1 class="auth-title">SudanPay</h1>
                    <p class="auth-subtitle">المحفظة الرقمية الآمنة في السودان</p>
                </div>
                
                <div class="form-group">
                    <label for="loginEmail">البريد الإلكتروني</label>
                    <div class="input-with-icon">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="loginEmail" placeholder="أدخل بريدك الإلكتروني" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="loginPassword">كلمة المرور</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <button type="button" class="password-toggle" onclick="togglePassword('loginPassword')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <input type="password" id="loginPassword" placeholder="أدخل كلمة المرور" required>
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="login()">
                    <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
                </button>
                
                <div class="divider">
                    <span>أو</span>
                </div>
                
                <button class="btn btn-google" onclick="loginWithGoogle()">
                    <i class="fab fa-google"></i> تسجيل الدخول بجوجل
                </button>
                
                <div class="auth-footer">
                    <p>ليس لديك حساب؟ <a href="#" onclick="showRegisterPage()">أنشئ حساب جديد</a></p>
                </div>
            </div>
        </div>
    `;
}

// عرض صفحة التسجيل
function showRegisterPage() {
    document.getElementById('app').innerHTML = `
        <div id="registerPage" class="auth-page">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-logo">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <h1 class="auth-title">إنشاء حساب جديد</h1>
                    <p class="auth-subtitle">انضم إلى SudanPay الآن</p>
                </div>
                
                <div class="form-group">
                    <label for="regName">الاسم الكامل</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" id="regName" placeholder="أدخل اسمك الكامل" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="regEmail">البريد الإلكتروني</label>
                    <div class="input-with-icon">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="regEmail" placeholder="أدخل بريدك الإلكتروني" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="regPassword">كلمة المرور</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <button type="button" class="password-toggle" onclick="togglePassword('regPassword')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <input type="password" id="regPassword" placeholder="أدخل كلمة المرور (6 أحرف على الأقل)" required minlength="6">
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="register()">
                    <i class="fas fa-user-plus"></i> إنشاء الحساب
                </button>
                
                <div class="auth-footer">
                    <p>لديك حساب بالفعل؟ <a href="#" onclick="initApp()">سجل الدخول الآن</a></p>
                </div>
            </div>
        </div>
    `;
}

// تسجيل الدخول
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('خطأ', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }
    
    try {
        // عرض رسالة تحميل
        const loginBtn = document.querySelector('#loginPage .btn-primary');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
        loginBtn.disabled = true;
        
        await auth.signInWithEmailAndPassword(email, password);
        showAlert('نجاح', 'تم تسجيل الدخول بنجاح', 'success');
    } catch (error) {
        // إعادة تعيين الزر
        const loginBtn = document.querySelector('#loginPage .btn-primary');
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
        
        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
        
        switch(error.code) {
            case 'auth/user-not-found':
                errorMessage = 'البريد الإلكتروني غير مسجل';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
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
        
        showAlert('خطأ في تسجيل الدخول', errorMessage, 'error');
    }
}

// تسجيل الدخول بجوجل
async function loginWithGoogle() {
    try {
        // عرض رسالة تحميل
        const googleBtn = document.querySelector('#loginPage .btn-google');
        const originalText = googleBtn.innerHTML;
        googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاتصال بجوجل...';
        googleBtn.disabled = true;
        
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        showAlert('نجاح', 'تم تسجيل الدخول بجوجل بنجاح', 'success');
    } catch (error) {
        // إعادة تعيين الزر
        const googleBtn = document.querySelector('#loginPage .btn-google');
        googleBtn.innerHTML = originalText;
        googleBtn.disabled = false;
        
        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول بجوجل';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'تم إغلاق نافذة تسجيل الدخول';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'تم إلغاء عملية تسجيل الدخول';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'هذا الحساب موجود بالفعل بمصادقة أخرى';
        }
        
        showAlert('خطأ في جوجل', errorMessage, 'error');
    }
}

// تسجيل حساب جديد
async function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    
    if (!name || !email || !password) {
        showAlert('خطأ', 'الرجاء إكمال جميع الحقول', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    try {
        // عرض رسالة تحميل
        const registerBtn = document.querySelector('#registerPage .btn-primary');
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
        registerBtn.disabled = true;
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            balance: 1000,
            phone: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showAlert('نجاح', 'تم إنشاء الحساب بنجاح', 'success');
        
        // الانتقال تلقائياً بعد 2 ثانية
        setTimeout(() => {
            initApp(); // العودة لصفحة تسجيل الدخول
        }, 2000);
        
    } catch (error) {
        // إعادة تعيين الزر
        const registerBtn = document.querySelector('#registerPage .btn-primary');
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
        
        let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'كلمة المرور ضعيفة جداً';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'البريد الإلكتروني غير صالح';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'عملية التسجيل معطلة مؤقتاً';
        }
        
        showAlert('خطأ في التسجيل', errorMessage, 'error');
    }
}

// مراقبة حالة المصادقة
function setupAuthListener() {
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            renderDashboard();
            loadUserData(user.uid);
        } else {
            renderLoginPage();
        }
    });
}

// عرض لوحة التحكم
function renderDashboard() {
    document.getElementById('app').innerHTML = `
        <div id="dashboard">
            <button class="menu-toggle" onclick="toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
            
            <nav class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <div class="logo">
                        <i class="fas fa-wallet"></i>
                        <span>SudanPay</span>
                    </div>
                </div>
                
                <div class="nav-menu">
                    <a href="#" class="nav-item active" onclick="showPage('home')">
                        <i class="fas fa-home"></i>
                        <span>الرئيسية</span>
                    </a>
                    
                    <a href="#" class="nav-item" onclick="showPage('send')">
                        <i class="fas fa-paper-plane"></i>
                        <span>إرسال أموال</span>
                    </a>
                    
                    <a href="#" class="nav-item" onclick="showPage('receive')">
                        <i class="fas fa-qrcode"></i>
                        <span>استلام أموال</span>
                    </a>
                    
                    <a href="#" class="nav-item" onclick="showPage('history')">
                        <i class="fas fa-history"></i>
                        <span>سجل العمليات</span>
                    </a>
                    
                    <a href="#" class="nav-item" onclick="showPage('profile')">
                        <i class="fas fa-user"></i>
                        <span>الملف الشخصي</span>
                    </a>
                </div>
                
                <div class="sidebar-footer">
                    <div class="user-profile">
                        <div class="user-avatar" id="userAvatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                            <h4 id="userNameDisplay">المستخدم</h4>
                            <p id="userEmailDisplay">جاري التحميل...</p>
                        </div>
                    </div>
                    <button class="btn btn-logout" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                    </button>
                </div>
            </nav>
            
            <main class="main-content" id="mainContent">
                <!-- سيتم تحميل المحتوى ديناميكياً -->
            </main>
        </div>
    `;
    
    showPage('home');
}

// عرض صفحة معينة
function showPage(page) {
    // تحديث القائمة
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        if (event && event.target) {
            event.target.classList.add('active');
        } else {
            // إذا لم يكن هناك حدث، قم بتنشيط أول عنصر
            document.querySelector('.nav-item').classList.add('active');
        }
    }
    
    switch(page) {
        case 'home':
            renderHomePage();
            break;
        case 'send':
            renderSendPage();
            break;
        case 'receive':
            renderReceivePage();
            break;
        case 'history':
            renderHistoryPage();
            break;
        case 'profile':
            renderProfilePage();
            break;
    }
}

// عرض الصفحة الرئيسية
function renderHomePage() {
    document.getElementById('mainContent').innerHTML = `
        <section id="home" class="page active">
            <div class="page-header">
                <h1><i class="fas fa-home"></i> الرئيسية</h1>
                <p>مرحباً بك في محفظتك الرقمية</p>
            </div>
            
            <div class="balance-card">
                <div class="balance-header">
                    <h3>الرصيد المتاح</h3>
                    <i class="fas fa-coins"></i>
                </div>
                <div class="balance-amount" id="currentBalance">0.00 <span>SDG</span></div>
                <div class="balance-footer">
                    <button class="btn-icon" onclick="showPage('send')">
                        <i class="fas fa-paper-plane"></i> إرسال
                    </button>
                    <button class="btn-icon" onclick="showPage('receive')">
                        <i class="fas fa-qrcode"></i> استقبال
                    </button>
                    <button class="btn-icon" onclick="refreshBalance()">
                        <i class="fas fa-sync-alt"></i> تحديث
                    </button>
                </div>
            </div>
            
            <div class="quick-actions">
                <div class="action-card" onclick="showPage('send')">
                    <div class="action-icon send">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <h4>إرسال أموال</h4>
                    <p>تحويل إلى أي شخص</p>
                </div>
                
                <div class="action-card" onclick="showPage('receive')">
                    <div class="action-icon receive">
                        <i class="fas fa-qrcode"></i>
                    </div>
                    <h4>طلب أموال</h4>
                    <p>إنشاء رمز الاستقبال</p>
                </div>
                
                <div class="action-card" onclick="showPage('history')">
                    <div class="action-icon history">
                        <i class="fas fa-history"></i>
                    </div>
                    <h4>سجل العمليات</h4>
                    <p>عرض جميع المعاملات</p>
                </div>
                
                <div class="action-card" onclick="showPage('profile')">
                    <div class="action-icon profile">
                        <i class="fas fa-user-cog"></i>
                    </div>
                    <h4>الإعدادات</h4>
                    <p>إدارة حسابك</p>
                </div>
            </div>
            
            <div class="card">
                <div class="section-header" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <h3>آخر العمليات</h3>
                    <a href="#" onclick="showPage('history')" style="color: #a3e635; text-decoration: none;">عرض الكل</a>
                </div>
                
                <div id="recentTransactionsList" class="transactions-list">
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>جاري تحميل العمليات...</p>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    if (currentUser) {
        loadUserData(currentUser.uid);
        loadRecentTransactions();
    }
}

// تحميل بيانات المستخدم
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            document.getElementById('userNameDisplay').textContent = userData.name || 'المستخدم';
            document.getElementById('userEmailDisplay').textContent = userData.email;
            document.getElementById('currentBalance').innerHTML = 
                (userData.balance || 0).toFixed(2) + ' <span>SDG</span>';
                
            const avatar = document.getElementById('userAvatar');
            if (userData.name) {
                avatar.innerHTML = userData.name.charAt(0).toUpperCase();
            } else {
                avatar.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
}

// تحميل العمليات الأخيرة
async function loadRecentTransactions() {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const listElement = document.getElementById('recentTransactionsList');
    
    if (!listElement) return;
    
    try {
        const snapshot = await db.collection('transactions')
            .where('senderId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            listElement.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">لا توجد عمليات سابقة</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = data.amount || 0;
            const description = data.description || 'عملية غير معروفة';
            const date = data.timestamp?.toDate() || new Date();
            
            html += `
                <div class="transaction-item">
                    <div class="transaction-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${description}</h4>
                        <p>${date.toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div class="transaction-amount" style="color: #ef4444;">
                        -${amount.toFixed(2)} SDG
                    </div>
                </div>
            `;
        });
        
        listElement.innerHTML = html;
    } catch (error) {
        console.error('خطأ في تحميل العمليات:', error);
        listElement.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 20px;">خطأ في تحميل البيانات</p>';
    }
}

// تسجيل الخروج
async function logout() {
    try {
        await auth.signOut();
        showAlert('نجاح', 'تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
        showAlert('خطأ', error.message, 'error');
    }
}

// وظائف مساعدة
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = input.parentElement.querySelector('.password-toggle i');
    if (!icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function refreshBalance() {
    if (currentUser) {
        loadUserData(currentUser.uid);
        showAlert('تحديث', 'تم تحديث الرصيد', 'info');
    }
}

// صفحات إضافية (مختصرة)
function renderSendPage() {
    document.getElementById('mainContent').innerHTML = `
        <section id="send" class="page active">
            <div class="page-header">
                <h1><i class="fas fa-paper-plane"></i> إرسال أموال</h1>
                <p>تحويل أموال آمن وسريع</p>
            </div>
            
            <div class="card">
                <div class="form-group">
                    <label for="toEmail">بريد المستلم</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="email" id="toEmail" placeholder="أدخل البريد الإلكتروني للمستلم" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="amount">المبلغ (SDG)</label>
                    <div class="input-with-icon">
                        <i class="fas fa-money-bill-wave"></i>
                        <input type="number" id="amount" placeholder="0.00" min="1" required>
                    </div>
                </div>
                
                <button class="btn btn-primary w-100" onclick="sendMoney()">
                    <i class="fas fa-paper-plane"></i> تأكيد الإرسال
                </button>
            </div>
        </section>
    `;
}

function renderReceivePage() {
    document.getElementById('mainContent').innerHTML = `
        <section id="receive" class="page active">
            <div class="page-header">
                <h1><i class="fas fa-qrcode"></i> استلام أموال</h1>
                <p>شارك رمزك لاستقبال الأموال</p>
            </div>
            
            <div class="card">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>جاري تحميل رمز الاستقبال...</p>
                </div>
            </div>
        </section>
    `;
}

function renderHistoryPage() {
    document.getElementById('mainContent').innerHTML = `
        <section id="history" class="page active">
            <div class="page-header">
                <h1><i class="fas fa-history"></i> سجل العمليات</h1>
                <p>عرض جميع معاملاتك المالية</p>
            </div>
            
            <div class="card">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>جاري تحميل سجل العمليات...</p>
                </div>
            </div>
        </section>
    `;
}

function renderProfilePage() {
    document.getElementById('mainContent').innerHTML = `
        <section id="profile" class="page active">
            <div class="page-header">
                <h1><i class="fas fa-user"></i> الملف الشخصي</h1>
                <p>إدارة معلومات حسابك</p>
            </div>
            
            <div class="card">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>جاري تحميل البيانات...</p>
                </div>
            </div>
        </section>
    `;
}

// وظيفة إرسال الأموال (مثال)
async function sendMoney() {
    showAlert('تطوير', 'هذه الميزة قيد التطوير', 'info');
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);

// جعل الدوال متاحة عالمياً
window.login = login;
window.loginWithGoogle = loginWithGoogle;
window.register = register;
window.logout = logout;
window.showPage = showPage;
window.togglePassword = togglePassword;
window.toggleSidebar = toggleSidebar;
window.showRegisterPage = showRegisterPage;
window.refreshBalance = refreshBalance;
window.sendMoney = sendMoney;
