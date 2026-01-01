import { auth, db, onAuthStateChanged, signOut, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from './app.js';

let currentUser = null;

// التحقق من الجلسة (Session)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loadUserData(user.uid);
    } else {
        window.location.href = "auth.html";
    }
});

// تحميل بيانات المستخدم
async function loadUserData(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('displayID').innerText = data.spID;
        document.getElementById('sdgBalance').innerText = data.balanceSDG.toLocaleString() + " ج.س";
        document.getElementById('usdtBalance').innerText = data.balanceUSDT + " USDT";
    }
}

// وظيفة تسجيل الخروج
document.getElementById('logoutBtn').onclick = () => {
    signOut(auth).then(() => window.location.href = "index.html");
};

// تبديل الأقسام (إرسال، استلام، تحويل)
window.showSection = (type) => {
    const container = document.getElementById('actionContent');
    if(type === 'swap') {
        container.innerHTML = `
            <h3>تحويل USDT إلى SDG</h3>
            <input type="number" id="swapAmount" placeholder="أدخل مبلغ USDT">
            <p>سعر الصرف الحالي: 1 USDT = 1,300 SDG</p>
            <button class="btn-full" id="confirmSwap">تأكيد التحويل</button>
        `;
        document.getElementById('confirmSwap').onclick = handleSwap;
    } else if(type === 'receive') {
        container.innerHTML = `
            <h3>استلام أموال</h3>
            <p>معرفك الخاص للاستلام هو:</p>
            <h2 style="color:#2196F3">${document.getElementById('displayID').innerText}</h2>
            <p>عنوان محفظة USDT (Tether):</p>
            <code style="background:#eee; padding:5px;">TY7xxxx...توضع_محفظتك_هنا</code>
        `;
    }
    // يمكنك إضافة باقي الحالات هنا (send, history) بنفس الطريقة
};

// منطق التحويل (Swap) وحفظ الإيصال
async function handleSwap() {
    const amount = parseFloat(document.getElementById('swapAmount').value);
    if(!amount || amount <= 0) return alert("أدخل مبلغاً صحيحاً");

    const rate = 1300; 
    const totalSDG = amount * rate;

    try {
        const userRef = doc(db, "users", currentUser.uid);
        // تحديث الرصيد في قاعدة البيانات
        await updateDoc(userRef, {
            balanceUSDT: increment(-amount), // ملاحظة: استورد 'increment' من firestore
            balanceSDG: increment(totalSDG)
        });

        // تسجيل المعاملة
        await addDoc(collection(db, "transactions"), {
            uid: currentUser.uid,
            type: "Swap",
            amountUSDT: amount,
            amountSDG: totalSDG,
            time: serverTimestamp()
        });

        // إظهار الإيصال
        showReceipt(amount, totalSDG);
        loadUserData(currentUser.uid); // تحديث الواجهة
    } catch (e) { alert("فشل التحويل: رصيد غير كافٍ"); }
}

function showReceipt(usdt, sdg) {
    const area = document.getElementById('receiptArea');
    area.style.display = 'block';
    document.getElementById('receiptDetails').innerText = `تحويل ${usdt} USDT إلى ${sdg} جنيه سوداني`;
    document.getElementById('receiptDate').innerText = "بتاريخ: " + new Date().toLocaleString();
}

// دالة حفظ الصورة
window.downloadReceipt = () => {
    html2canvas(document.querySelector("#receiptArea")).then(canvas => {
        const link = document.createElement('a');
        link.download = 'SudanPay-Receipt.png';
        link.href = canvas.toDataURL();
        link.click();
    });
};
