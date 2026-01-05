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
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// ==================== دالة رقم حساب فريد ====================
async function generateUniqueAccountID() {
    let accountID;
    let isUnique = false;
    
    while (!isUnique) {
        accountID = 'SP' + Math.floor(100000 + Math.random() * 900000);
        
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("accountID", "==", accountID));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            isUnique = true;
        }
    }
    
    return accountID;
}

// ==================== دالة KYC ====================
async function uploadKYCImage(userId, file, type) {
    try {
        const storageRef = ref(storage, `kyc/${userId}/${type}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        throw error;
    }
}

// ==================== إنشاء حساب مع KYC ====================
async function signUpWithKYC(email, password, name, idImageFile, selfieImageFile) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const accountID = await generateUniqueAccountID();
        
        const idUrl = await uploadKYCImage(user.uid, idImageFile, 'id');
        const selfieUrl = await uploadKYCImage(user.uid, selfieImageFile, 'selfie');
        
        await setDoc(doc(db, 'users', user.uid), {
            name: name || user.email.split('@')[0],
            email: email,
            accountID: accountID,
            usdtAddress: '',
            balanceSDG: 0.00,
            balanceUSDT: 0.00,
            kycStatus: 'pending',
            idUrl: idUrl,
            selfieUrl: selfieUrl,
            phone: '',
            photoURL: '',
            unreadNotifications: 0,
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

// ==================== توليد صورة الإشعار ====================
async function generateNotificationImage(notificationData) {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createLinearGradient(0, 0, 800, 400);
            gradient.addColorStop(0, '#0d9488');
            gradient.addColorStop(1, '#0891b2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 800, 400);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = '40px "Cairo", Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🇸🇩 Sudan Pay', 400, 60);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 36px "Cairo", Arial';
            ctx.fillText('تمت عملية التحويل بنجاح', 400, 120);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(100, 150);
            ctx.lineTo(700, 150);
            ctx.stroke();

            ctx.font = '28px "Cairo", Arial';
            ctx.textAlign = 'right';
            
            ctx.fillText(`👤 إلى: ${notificationData.receiverName}`, 700, 200);
            ctx.fillText(`📊 رقم الحساب: ${notificationData.receiverAccount}`, 700, 240);
            ctx.fillText(`💰 المبلغ: ${notificationData.amount.toLocaleString()} ${notificationData.currency}`, 700, 280);
            ctx.fillText(`📅 ${notificationData.date}`, 700, 320);
            
            if (notificationData.comment) {
                ctx.fillText(`💬 ${notificationData.comment}`, 700, 360);
            }

            const imageUrl = canvas.toDataURL('image/png');
            resolve(imageUrl);
        } catch (error) {
            console.error('خطأ في توليد صورة الإشعار:', error);
            resolve(null);
        }
    });
}

// ==================== إرسال إشعار داخلي ====================
async function sendInternalNotification(senderId, receiverId, notificationData) {
    try {
        const notificationImage = await generateNotificationImage(notificationData);
        
        const notificationRef = await addDoc(collection(db, 'notifications'), {
            senderId: senderId,
            receiverId: receiverId,
            type: notificationData.type || 'transfer',
            amount: notificationData.amount,
            currency: notificationData.currency,
            receiverName: notificationData.receiverName,
            receiverAccount: notificationData.receiverAccount,
            comment: notificationData.comment || '',
            date: notificationData.date || new Date().toLocaleDateString('ar-EG'),
            imageUrl: notificationImage,
            isRead: false,
            createdAt: serverTimestamp(),
            readAt: null
        });

        await updateDoc(doc(db, 'users', receiverId), {
            unreadNotifications: increment(1)
        });

        return {
            success: true,
            notificationId: notificationRef.id,
            hasImage: !!notificationImage
        };
    } catch (error) {
        console.error('خطأ في إرسال الإشعار:', error);
        throw error;
    }
}

// ==================== تحويل USDT إلى SDG ====================
async function convertUSDTtoSDG(userId, usdtAmount) {
    try {
        const conversionRate = 2600;
        const sdgAmount = usdtAmount * conversionRate;
        
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error('المستخدم غير موجود');
        }
        
        const userData = userDoc.data();
        
        if (userData.balanceUSDT < usdtAmount) {
            throw new Error('رصيد USDT غير كافٍ');
        }
        
        await updateDoc(userRef, {
            balanceUSDT: increment(-usdtAmount),
            balanceSDG: increment(sdgAmount),
            transactions: arrayUnion({
                type: 'convert',
                from: 'USDT',
                to: 'SDG',
                amount: usdtAmount,
                convertedAmount: sdgAmount,
                rate: conversionRate,
                timestamp: new Date().toISOString(),
                status: 'completed'
            }),
            updatedAt: serverTimestamp()
        });
        
        return { success: true, sdgAmount };
    } catch (error) {
        throw error;
    }
}

// ==================== تحويل SDG بين المستخدمين ====================
async function transferSDG(senderUserId, receiverAccountID, amount, description = '', comment = '') {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("accountID", "==", receiverAccountID));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('رقم الحساب غير موجود');
        }
        
        const receiverDoc = querySnapshot.docs[0];
        const receiverId = receiverDoc.id;
        const receiverData = receiverDoc.data();
        
        if (senderUserId === receiverId) {
            throw new Error('لا يمكنك التحويل لنفسك');
        }
        
        const senderDoc = await getDoc(doc(db, 'users', senderUserId));
        const senderData = senderDoc.data();
        
        if (senderData.balanceSDG < amount) {
            throw new Error('رصيدك غير كافٍ');
        }
        
        const timestamp = new Date().toISOString();
        
        await updateDoc(doc(db, 'users', senderUserId), {
            balanceSDG: increment(-amount),
            transactions: arrayUnion({
                type: 'send',
                amount: amount,
                currency: 'SDG',
                to: receiverAccountID,
                description: description || `تحويل إلى ${receiverData.name}`,
                timestamp: timestamp,
                status: 'completed'
            })
        });
        
        await updateDoc(doc(db, 'users', receiverId), {
            balanceSDG: increment(amount),
            transactions: arrayUnion({
                type: 'receive',
                amount: amount,
                currency: 'SDG',
                from: senderData.accountID,
                description: description || `استلام من ${senderData.name}`,
                timestamp: timestamp,
                status: 'completed'
            })
        });
        
        const notificationData = {
            type: 'receive',
            amount: amount,
            currency: 'SDG',
            receiverName: senderData.name,
            receiverAccount: senderData.accountID,
            date: new Date().toLocaleDateString('ar-EG'),
            comment: comment || description || 'تحويل ناجح'
        };
        
        await sendInternalNotification(senderUserId, receiverId, notificationData);
        
        const senderNotificationData = {
            type: 'send_confirmation',
            amount: amount,
            currency: 'SDG',
            receiverName: receiverData.name,
            receiverAccount: receiverAccountID,
            date: new Date().toLocaleDateString('ar-EG'),
            comment: 'تم إرسال التحويل بنجاح'
        };
        
        await sendInternalNotification(senderUserId, senderUserId, senderNotificationData);
        
        return { 
            success: true, 
            receiverName: receiverData.name,
            transactionId: `${senderData.accountID}-${timestamp}`
        };
    } catch (error) {
        throw error;
    }
}

// ==================== تحويل USDT عبر عنوان المحفظة ====================
async function transferUSDT(senderUserId, receiverWalletAddress, amount, description = '') {
    try {
        const senderDoc = await getDoc(doc(db, 'users', senderUserId));
        const senderData = senderDoc.data();
        
        if (senderData.balanceUSDT < amount) {
            throw new Error('رصيد USDT غير كافٍ');
        }
        
        const transactionId = 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        await updateDoc(doc(db, 'users', senderUserId), {
            balanceUSDT: increment(-amount),
            transactions: arrayUnion({
                type: 'send_usdt',
                amount: amount,
                currency: 'USDT',
                to: receiverWalletAddress,
                description: description || `تحويل USDT`,
                timestamp: new Date().toISOString(),
                transactionId: transactionId,
                status: 'pending'
            })
        });
        
        return { 
            success: true, 
            transactionId: transactionId,
            message: 'تم إرسال USDT، في انتظار تأكيد الشبكة'
        };
    } catch (error) {
        throw error;
    }
}

// ==================== سحب الأموال ====================
async function withdrawFunds(userId, amount, currency = 'SDG', method = 'bank') {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        
        const balanceField = currency === 'SDG' ? 'balanceSDG' : 'balanceUSDT';
        
        if (userData[balanceField] < amount) {
            throw new Error('الرصيد غير كافٍ');
        }
        
        const withdrawalRef = await addDoc(collection(db, 'withdrawals'), {
            userId: userId,
            accountID: userData.accountID,
            amount: amount,
            currency: currency,
            method: method,
            status: 'pending',
            createdAt: serverTimestamp(),
            processedAt: null
        });
        
        await updateDoc(userRef, {
            [balanceField]: increment(-amount),
            transactions: arrayUnion({
                type: 'withdrawal_request',
                amount: amount,
                currency: currency,
                withdrawalId: withdrawalRef.id,
                timestamp: new Date().toISOString(),
                status: 'pending'
            })
        });
        
        return { 
            success: true, 
            withdrawalId: withdrawalRef.id,
            message: 'تم تقديم طلب السحب بنجاح، سيتم معالجته خلال 24 ساعة'
        };
    } catch (error) {
        throw error;
    }
}

// ==================== البحث عن مستخدم برقم الحساب ====================
async function getUserByAccountID(accountID) {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("accountID", "==", accountID));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        
        const userDoc = querySnapshot.docs[0];
        return {
            id: userDoc.id,
            ...userDoc.data()
        };
    } catch (error) {
        throw error;
    }
}

// ==================== الدوال الأساسية ====================
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

async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

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
                accountID: await generateUniqueAccountID(),
                usdtAddress: '',
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

async function logoutUser() {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        throw error;
    }
}

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

// ==================== تصدير الدوال ====================
export { 
    auth, db, storage, app, provider,
    generateUniqueAccountID,
    signUpWithKYC,
    convertUSDTtoSDG,
    transferSDG,
    transferUSDT,
    withdrawFunds,
    getUserByAccountID,
    sendInternalNotification,
    loginWithEmail, 
    loginWithGoogle, 
    logoutUser, 
    getUserData,
    showAlert
};

// ==================== تهيئة التطبيق ====================
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

function initApp() {
    addAlertStyles();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('المستخدم مسجل:', user.email);
        }
    });
}

// ==================== جعل الدوال متاحة عالمياً ====================
window.loginWithEmail = loginWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.logoutUser = logoutUser;
window.showAlert = showAlert;
window.transferSDG = transferSDG;

initApp();
