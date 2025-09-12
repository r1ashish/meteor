import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAySEaf8mkkNQf7p6ulodLGLVKEH_oWrro",
  authDomain: "meteor-store.firebaseapp.com",
  projectId: "meteor-store",
  storageBucket: "meteor-store.firebasestorage.app",
  messagingSenderId: "933754508418",
  appId: "1:933754508418:web:c66bdd895e5a273997509b",
  measurementId: "G-HVND6E546D"
};

// Initialize Firebase (NO FIRESTORE)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Admin email addresses
const ADMIN_EMAILS = [
  'ashish8921singh@gmail.com',
];

// Check if user is admin
export const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('Google login success:', user.email);
    console.log('Is admin:', isAdminEmail(user.email));
    
    return { success: true, user, isAdmin: isAdminEmail(user.email) };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: error.message };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log('Email login success:', user.email);
    console.log('Is admin:', isAdminEmail(user.email));
    
    return { success: true, user, isAdmin: isAdminEmail(user.email) };
  } catch (error) {
    console.error('Email login error:', error);
    return { success: false, error: error.message };
  }
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log('Email signup success:', user.email);
    console.log('Is admin:', isAdminEmail(user.email));
    
    return { success: true, user, isAdmin: isAdminEmail(user.email) };
  } catch (error) {
    console.error('Email signup error:', error);
    return { success: false, error: error.message };
  }
};

// Get user data (simple version without Firestore)
export const getUserData = async (user) => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    photoURL: user.photoURL,
    isAdmin: isAdminEmail(user.email),
    role: isAdminEmail(user.email) ? 'admin' : 'user'
  };
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};
