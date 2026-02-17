import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Redirect to the app-router forgot-password page
// This keeps the /reset-password URL working if anyone has it bookmarked
export default function ResetPasswordRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/forgot-password');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
    </div>
  );
}
