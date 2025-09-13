import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, updateProfile, getIdToken } from 'firebase/auth';
import { auth, isAdminEmail } from '../firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData]       = useState(null);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [authError, setAuthError]     = useState('');

  // Subscribe to auth state
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const basic = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || (user.email ? user.email.split('@') : 'User'),
            photoURL: user.photoURL || '',
            isAdmin: isAdminEmail(user.email || ''),
            role: isAdminEmail(user.email || '') ? 'admin' : 'user'
          };
          setCurrentUser(user);
          setUserData(basic);
          setIsAdmin(basic.isAdmin);
        } else {
          setCurrentUser(null);
          setUserData(null);
          setIsAdmin(false);
        }
      } catch (e) {
        console.error('Auth state error:', e);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Auth helpers
  const login = async (email, password) => {
    setAuthError('');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, displayName) => {
    setAuthError('');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  };

  const loginWithGoogle = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    setAuthError('');
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    setAuthError('');
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
    }
  };

  const getToken = async () => {
    if (!auth.currentUser) return null;
    try {
      return await getIdToken(auth.currentUser, /* forceRefresh */ true);
    } catch {
      return null;
    }
  };

  const value = useMemo(() => ({
    currentUser,
    userData,
    isAdmin,
    loading,
    authError,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUser,
    getToken,
  }), [currentUser, userData, isAdmin, loading, authError]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
