"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface UseAuthOptions {
  redirectTo?: string;
}

export function useAuth(options?: UseAuthOptions) {
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/login";
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) {
        router.push(redirectTo);
      } else {
        setSession(s);
      }
      setLoading(false);
    });
  }, [router, redirectTo]);

  return { session, loading, userId: session?.user?.id ?? null, token: session?.access_token ?? null };
}
