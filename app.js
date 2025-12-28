const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();

// --- وظيفة الدخول عبر قوقل ---
window.loginWithGoogle = async function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // التحقق إذا كان المستخدم جديداً لإنشاء وثيقة له في Firestore
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (!userDoc.exists) {
            await db.collection("users").doc(user.uid).set({
                name: user.displayName,
                email: user.email,
                balance: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        window.location.href = "dashboard.html";
    } catch (error) {
        showNotify("فشل تسجيل الدخول عبر قوقل", "error");
    }
};

// (بقية الدوال السابقة: login, sendMoney, showNotify تبقى كما هي)
 
