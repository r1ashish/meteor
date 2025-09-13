import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Optional: if you keep helper exports in firebase/config, you can still use them,
// but the recommended way is to call context helpers directly from useAuth.

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth context provides full helpers (login, signup, loginWithGoogle, resetPassword, etc.)
  const {
    currentUser, isAdmin, loading: authLoading,
    login, signup, loginWithGoogle, resetPassword
  } = useAuth();

  // UI state
  const [credentials, setCredentials] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Decide post-login target (support query ?next=/admin#orders)
  const nextPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('next') || '/admin#dashboard';
  }, [location.search]);

  // Redirect if already logged in
  useEffect(() => {
    if (authLoading) return;
    if (currentUser && isAdmin) {
      navigate(nextPath, { replace: true });
    } else if (currentUser && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/', { replace: true });
    }
  }, [currentUser, isAdmin, authLoading, navigate, nextPath]);

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function handleGoogleLogin() {
    if (authLoading || loading) return;
    setLoading(true);
    const t = toast.loading('Signing in with Google...');
    try {
      await loginWithGoogle();
      toast.dismiss(t);
      toast.success('Signed in with Google');
      // The effect will navigate if admin
    } catch (e) {
      toast.dismiss(t);
      toast.error('Google sign-in failed');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    if (authLoading || loading) return;

    const { email, password, name } = credentials;
    if (!validateEmail(email)) return toast.error('Enter a valid email');
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    const t = toast.loading(isSignUp ? 'Creating account...' : 'Signing in...');
    try {
      if (isSignUp) {
        await signup(email, password, name || email.split('@'));
        toast.dismiss(t);
        toast.success('Account created');
      } else {
        await login(email, password);
        toast.dismiss(t);
        toast.success('Signed in');
      }
      // Redirect handled by effect if admin
    } catch (e) {
      toast.dismiss(t);
      const msg = e?.message?.toLowerCase?.() || '';
      if (msg.includes('password')) toast.error('Invalid email or password');
      else toast.error('Authentication failed');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) return toast.error('Enter a valid email');
    const t = toast.loading('Sending reset link...');
    try {
      await resetPassword(forgotEmail);
      toast.dismiss(t);
      toast.success('Password reset email sent');
      setShowForgot(false);
      setForgotEmail('');
    } catch (e) {
      toast.dismiss(t);
      toast.error('Failed to send reset email');
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Meteor Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to manage products, orders, and inventory</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || authLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in…' : 'Sign in with Google'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email / Password */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  type="text"
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your name"
                  value={credentials.name}
                  onChange={e => setCredentials(c => ({ ...c, name: e.target.value }))}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={e => setCredentials(c => ({ ...c, email: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={e => setCredentials(c => ({ ...c, password: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full py-3 px-4 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Processing…' : (isSignUp ? 'Create Account' : 'Sign in')}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(v => !v)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold">Reset your password</h3>
            <form onSubmit={handleForgot} className="space-y-3">
              <input
                type="email"
                placeholder="Your account email"
                className="w-full border px-3 py-2 rounded"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-2 border rounded"
                  onClick={() => setShowForgot(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 text-white rounded"
                >
                  Send reset link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
