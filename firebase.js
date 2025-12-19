import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3vxJu_et-P80ek30I3MRdC_lGhooCCsc",
  authDomain: "sudanpay-e332a.firebaseapp.com",
  projectId: "sudanpay-e332a",
  storageBucket: "sudanpay-e332a.appspot.com",
  messagingSenderId: "699809447272",
  appId: "1:699809447272:web:90f3780ed6c768c4322add"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
