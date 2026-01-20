"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";

type Profile = {
  email: string;
  full_name?: string;
  id: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      // Check authentication
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
        return;
      }

      // Try to load from backend, fallback to Supabase auth data
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const backendProfile = await apiFetch<Profile>("/me", {}, token);
        setProfile(backendProfile);
      } catch (e) {
        // Fallback to Supabase user data
        setProfile({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">My Profile</h1>

        {!profile ? (
          <div className="text-gray-400 text-sm">No profile data available</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="text-sm">
              <span className="text-gray-500">Email:</span>{" "}
              <span className="font-semibold">{profile.email}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Full Name:</span>{" "}
              <span className="font-semibold">
                {profile.full_name || "Not set"}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              User ID: {profile.id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
