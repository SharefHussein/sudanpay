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
let qrCode = null;

// تهيئة التطبيق
function initApp() {
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
        await auth.signInWithEmailAndPassword(email, password);
        showAlert('نجاح', 'تم تسجيل الدخول بنجاح', 'success');
    } catch (error) {
        showAlert('خطأ', error.message, 'error');
    }
}

// تسجيل الدخول بجوجل
async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        showAlert('نجاح', 'تم تسجيل الدخول بجوجل بنجاح', 'success');
    } catch (error) {
        showAlert('خطأ', error.message, 'error');
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
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            balance: 1000,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showAlert('نجاح', 'تم إنشاء الحساب بنجاح', 'success');
        initApp();
    } catch (error) {
        showAlert('خطأ', error.message, 'error');
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
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const content = document.getElementById('mainContent');
    
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
                    <a href="#" onclick="showPage('history')" style="color: var(--accent); text-decoration: none;">عرض الكل</a>
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
    
    loadRecentTransactions();
}

// تحميل بيانات المستخدم
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            document.getElementById('userNameDisplay').textContent = userData.name || 'المستخدم';
            document.getElementById('userEmailDisplay').textContent = userData.email;
            document.getElementById('currentBalance').textContent = 
                (userData.balance || 0).toFixed(2) + ' <span>SDG</span>';
                
            const avatar = document.getElementById('userAvatar');
            avatar.innerHTML = userData.name ? userData.name.charAt(0).toUpperCase() : '<i class="fas fa-user"></i>';
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
}

// تحميل العمليات الأخيرة
async function loadRecentTransactions() {
    const userId = currentUser.uid;
    const listElement = document.getElementById('recentTransactionsList');
    
    try {
        const snapshot = await db.collection('transactions')
            .where('senderId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            listElement.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">لا توجد عمليات سابقة</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = data.amount || 0;
            const type = data.type || 'send';
            const description = data.description || 'عملية غير معروفة';
            const date = data.timestamp?.toDate() || new Date();
            
            html += `
                <div class="transaction-item">
                    <div class="transaction-icon" style="background: rgba(239,68,68,0.1); color: var(--danger);">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${description}</h4>
                        <p>${date.toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div class="transaction-amount negative">
                        -${amount.toFixed(2)} SDG
                    </div>
                </div>
            `;
        });
        
        listElement.innerHTML = html;
    } catch (error) {
        listElement.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 20px;">خطأ في تحميل البيانات</p>';
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
    const icon = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function showAlert(title, message, type) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <div>
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// تهيئة التطبيق عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', initApp);

// جعل الدوال متاحة عالمياً
window.login = login;
window.loginWithGoogle = loginWithGoogle;
window.register = register;
window.logout = logout;
window.showPage = showPage;
window.togglePassword = togglePassword;
window.toggleSidebar = toggleSidebar;
window.showRegisterPage = showRegisterPage;
