import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig } from './env';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const messaging = getMessaging(app);

const signInWithGoogle = () => signInWithPopup(auth, provider);
const signOutUser = () => signOut(auth);

export { auth, db, provider, signInWithGoogle, signOutUser, setDoc, doc , getDoc, messaging, getToken, onMessage }; 
