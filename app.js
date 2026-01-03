import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc,
    increment,
    arrayUnion,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
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

// دالة لإنشاء رقم حساب فريد للموقع
function generateAccountID() {
    return 'SP-' + Math.floor(100000 + Math.random() * 900000);
}

// دالة مؤقتة لتوليد عنوان USDT (سيتم استبدالها لاحقاً بـ API Coinremitter)
function generateUSDTAddressPlaceholder() {
    return "T" + Math.random().toString(36).substr(2, 33).toUpperCase();
}

// دالة لعرض التنبيهات
function showAlert(message, type = 'error') {
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

// تسجيل الدخول بالبريد
async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

// تسجيل الدخول بجوجل
async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                accountID: generateAccountID(),
                usdtAddress: generateUSDTAddressPlaceholder(),
                balanceSDG: 0.00,
                balanceUSDT: 0.00,
                photoURL: user.photoURL || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                provider: 'google'
            });
        }
        
        return user;
    } catch (error) {
        throw error;
    }
}

// إنشاء حساب جديد
async function signUpWithEmail(email, password, name = '') {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const accountID = generateAccountID();
        
        await setDoc(doc(db, 'users', user.uid), {
            name: name || user.email.split('@')[0],
            email: email,
            accountID: accountID,
            usdtAddress: generateUSDTAddressPlaceholder(),
            balanceSDG: 0.00,
            balanceUSDT: 0.00,
            phone: '',
            photoURL: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            transactions: [],
            provider: 'email'
        });
        
        return { user, accountID };
    } catch (error) {
        throw error;
    }
}

// تسجيل الخروج
async function logoutUser() {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        throw error;
    }
}

// جلب بيانات المستخدم
async function getUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        throw error;
    }
}

// تحديث رصيد المستخدم
async function updateUserBalance(userId, amount, currency = 'SDG', type = 'deposit', description = '') {
    try {
        const userRef = doc(db, 'users', userId);
        const balanceField = currency === 'SDG' ? 'balanceSDG' : 'balanceUSDT';
        
        await updateDoc(userRef, {
            [balanceField]: increment(type === 'send' ? -amount : amount),
            transactions: arrayUnion({
                type: type,
                amount: amount,
                currency: currency,
                description: description,
                timestamp: new Date().toISOString(),
                status: 'completed'
            }),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        throw error;
    }
}

// دالة التحويل بين المستخدمين باستخدام رقم الحساب (تُستخدم في صفحة send)
async function transferByAccountID(receiverAccountID, amount, currency = 'SDG') {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');

        // 1. البحث عن المستلم بواسطة accountID
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("accountID", "==", receiverAccountID));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('عذراً، رقم الحساب هذا غير موجود في النظام');
        }

        const receiverDoc = querySnapshot.docs[0];
        const receiverId = receiverDoc.id;
        const receiverData = receiverDoc.data();

        if (currentUser.uid === receiverId) {
            throw new Error('لا يمكنك التحويل إلى حسابك الشخصي');
        }

        // 2. التحقق من رصيد المرسل
        const senderData = await getUserData(currentUser.uid);
        const balanceField = currency === 'SDG' ? 'balanceSDG' : 'balanceUSDT';
        if (senderData[balanceField] < amount) {
            throw new Error('عذراً، رصيدك غير كافٍ لإتمام هذه العملية');
        }

        // 3. تنفيذ عملية الخصم من المرسل
        await updateUserBalance(currentUser.uid, amount, currency, 'send', `تحويل إلى ${receiverAccountID}`);

        // 4. تنفيذ عملية الإضافة للمستلم
        await updateUserBalance(receiverId, amount, currency, 'receive', `استلام من ${senderData.accountID}`);

        return { success: true, receiverName: receiverData.name };
    } catch (error) {
        throw error;
    }
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
        .alert-success .alert-content { border-right: 4px solid #10b981; }
        .alert-error .alert-content { border-right: 4px solid #ef4444; }
        .alert-content h4 { margin: 0 0 5px 0; color: white; font-size: 1rem; }
        .alert-content p { margin: 0; color: #94a3b8; font-size: 0.9rem; }
        .alert-close { margin-right: auto; background: none; border: none; color: #94a3b8; cursor: pointer; }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    `;
    document.head.appendChild(style);
}

// تهيئة التطبيق
function initApp() {
    addAlertStyles();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('المستخدم مسجل:', user.email);
        }
    });
}

// تصدير الدوال
export { 
    auth, db, app, provider,
    generateAccountID,
    loginWithEmail, 
    loginWithGoogle, 
    signUpWithEmail, 
    logoutUser, 
    getUserData,
    updateUserBalance,
    transferByAccountID,
    showAlert,
    initApp 
};

initApp();

// جعل الدوال متاحة عالمياً لصفحة html
window.loginWithEmail = loginWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.logoutUser = logoutUser;
window.showAlert = showAlert;
window.transferByAccountID = transferByAccountID;

