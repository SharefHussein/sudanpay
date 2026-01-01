import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let currentUser = null;

// مراقبة حالة الدخول
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        if (window.location.pathname.endsWith('login.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        } else {
            loadUserData(user.uid);
        }
    } else {
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
});

// تسجيل الدخول بالإيميل
window.loginEmail = () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    if (!email || !pass) return alert("أدخل الإيميل وكلمة المرور");
    signInWithEmailAndPassword(auth, email, pass)
        .catch(err => alert("خطأ في الدخول: " + err.message));
};

// إنشاء حساب جديد
window.signUpEmail = () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    if (!email || !pass) return alert("أدخل الإيميل وكلمة المرور");
    createUserWithEmailAndPassword(auth, email, pass)
        .then(() => {
            alert("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن.");
        })
        .catch(err => alert("خطأ في التسجيل: " + err.message));
};

// دخول جوجل
window.loginWithGoogle = () => signInWithPopup(auth, provider);

// تحميل بيانات المستخدم
async function loadUserData(uid) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
        await setDoc(userRef, { balance: 1000.00, transactions: [] });
        document.getElementById('balance').innerText = "1,000.00 SDG";
    } else {
        const data = snap.data();
        document.getElementById('balance').innerText = data.balance.toFixed(2) + " SDG";
        const list = document.getElementById('transactionsList');
        if (list) {
            list.innerHTML = '';
            if (data.transactions.length === 0) {
                list.innerHTML = '<p class="text-center text-gray-500">لا توجد معاملات بعد</p>';
            } else {
                data.transactions.reverse().forEach(t => {
                    const div = document.createElement('div');
                    div.className = 'card flex justify-between items-center';
                    div.innerHTML = `
                        <div>
                            <p class="font-bold">${t.description}</p>
                            <p class="text-sm text-gray-500">${new Date(t.timestamp.seconds * 1000).toLocaleString('ar')}</p>
                        </div>
                        <p class="\( {t.amount > 0 ? 'text-green-600' : 'text-red-600'} font-bold"> \){t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)} SDG</p>
                    `;
                    list.appendChild(div);
                });
            }
        }
    }
}

// فتح/إغلاق المودال
window.openSendModal = () => document.getElementById('sendModal').classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');
window.openTransactions = () => document.getElementById('transactionsSection').classList.toggle('hidden');

// إرسال أموال
window.sendMoney = async () => {
    const recipient = document.getElementById('recipientPhone').value.trim();
    const amount = parseFloat(document.getElementById('sendAmount').value);
    if (!recipient || isNaN(amount) || amount <= 0) return alert("أدخل بيانات صحيحة");

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
        balance: increment(-amount),
        transactions: arrayUnion({
            description: `تحويل إلى ${recipient}`,
            amount: -amount,
            timestamp: serverTimestamp()
        })
    });
    alert("تم التحويل بنجاح!");
    closeModal('sendModal');
    loadUserData(currentUser.uid);
};
