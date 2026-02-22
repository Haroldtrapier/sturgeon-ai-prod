import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/ssr';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase sends the user back with hash fragments containing the session
    // The Supabase client auto-detects these and sets the session
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const checkSession = async () => {
      // Give Supabase a moment to process the hash fragments
      await new Promise(r => setTimeout(r, 500));

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setChecking(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" />
      </div>
    );
  }

  if (!ready && !success) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-stone-500 text-sm mb-6">{error}</p>
          <button onClick={() => router.push('/forgot-password')} className="px-6 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 text-sm font-medium">
            Request New Reset Link
          </button>
          <div className="mt-4">
            <button onClick={() => router.push('/login')} className="text-sm text-lime-700 hover:underline">
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-4xl mb-4">&#9989;</div>
          <h1 className="text-2xl font-bold text-lime-700 mb-2">Password Updated</h1>
          <p className="text-stone-500 text-sm">Your password has been reset successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-lime-700">Harpoon AI</h1>
          <p className="text-stone-500 mt-2 text-sm">Set your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Min 8 characters"
              minLength={8}
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm password"
              minLength={8}
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm text-white"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-900/20 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium text-sm"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          <button onClick={() => router.push('/login')} className="text-lime-700 hover:underline font-medium">Back to login</button>
        </p>
      </div>
    </div>
  );
}
