"use client";

import { useEffect, useState } from "react";
import { APIClient } from "../../lib/api";

type Profile = {
  email: string;
  full_name?: string;
  id: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    APIClient.getProfile().then(setProfile);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">My Profile</h1>

      {!profile ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
          <div className="text-sm">
            <span className="text-slate-400">Email:</span>{" "}
            <span className="font-semibold">{profile.email}</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Full Name:</span>{" "}
            <span className="font-semibold">
              {profile.full_name || "Not set"}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            User ID: {profile.id}
          </div>
        </div>
      )}
    </div>
  );
}
