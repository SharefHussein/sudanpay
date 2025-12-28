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

// نظام التنبيهات
window.showNotify = function(message, type = "success") {
    const notif = document.createElement("div");
    notif.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%) translateY(-100px); padding:15px 30px; border-radius:20px; z-index:10000; font-size:14px; font-weight:bold; transition:all 0.5s ease; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 30px rgba(0,0,0,0.3); display:flex; align-items:center; gap:10px;`;
    if (type === "success") { notif.style.backgroundColor = "rgba(163, 230, 53, 0.9)"; notif.style.color = "#000"; }
    else { notif.style.backgroundColor = "rgba(239, 68, 68, 0.9)"; notif.style.color = "#fff"; }
    notif.innerText = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.style.transform = "translateX(-50%) translateY(0)", 100);
    setTimeout(() => { notif.style.transform = "translateX(-50%) translateY(-100px)"; setTimeout(() => notif.remove(), 500); }, 3000);
};

// الدخول بالإيميل (تم الإصلاح)
window.login = async function() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value;
    if (!email || !pass) { showNotify("أدخل البيانات", "error"); return; }
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        window.location.href = "dashboard.html";
    } catch (e) { showNotify("البيانات غير صحيحة", "error"); }
};

// الدخول بجوجل
window.loginWithGoogle = async function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (!userDoc.exists) {
            await db.collection("users").doc(user.uid).set({
                name: user.displayName, email: user.email, balance: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        window.location.href = "dashboard.html";
    } catch (e) { showNotify("فشل دخول جوجل", "error"); }
};

// تحميل العمليات (كشف الحساب)
window.loadTransactions = function(userEmail) {
    const list = document.getElementById("txList");
    if(!list) return;
    db.collection("transactions").where("participants", "array-contains", userEmail).orderBy("createdAt", "desc").onSnapshot(snap => {
        list.innerHTML = "";
        if(snap.empty) { list.innerHTML = "<p class='text-center text-gray-500'>لا توجد عمليات</p>"; return; }
        snap.forEach(doc => {
            const tx = doc.data();
            const isOut = tx.from === userEmail;
            list.innerHTML += `
                <div class="glass-card p-4 mb-3 flex justify-between items-center border-r-4 ${isOut ? 'border-red-500' : 'border-[#a3e635]'}">
                    <div class="text-right">
                        <p class="font-bold text-sm text-white">${isOut ? 'إلى: ' + tx.to : 'من: ' + tx.from}</p>
                        <p class="text-[10px] text-gray-500">${tx.createdAt?.toDate().toLocaleString('ar-EG')}</p>
                    </div>
                    <p class="font-black ${isOut ? 'text-white' : 'text-[#a3e635]'}">${isOut ? '-' : '+'}${tx.amount} SDG</p>
                </div>`;
        });
    });
};
 
