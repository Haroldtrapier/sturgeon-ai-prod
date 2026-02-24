"use client";

import { Bell, Lock, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            {[{icon: <Bell size={20} />, label: "Notifications", active: true},{icon: <Lock size={20} />, label: "Security"},{icon: <CreditCard size={20} />, label: "Billing"}].map((i, idx) => (
              <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 ${i.active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}>{i.icon}<span>{i.label}</span></button>
            ))}
          </div>
          <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
            {[{title: "Email Notifications", desc: "Receive email updates"},{title: "Push Notifications", desc: "Get notified about matches"}].map((i, idx) => (
              <div key={idx} className="flex justify-between p-4 border rounded-lg mb-3">
                <div><div className="font-semibold">{i.title}</div><div className="text-sm text-gray-600">{i.desc}</div></div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}