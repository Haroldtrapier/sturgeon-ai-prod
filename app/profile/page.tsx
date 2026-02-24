"use client";

import { User, Building, Mail, MapPin, Edit } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">JD</div>
            <h2 className="text-2xl font-bold mb-1">John Doe</h2>
            <p className="text-gray-600 mb-4">CEO</p>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold"><Edit size={16} className="inline mr-2" />Edit Profile</button>
          </div>
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Personal Information</h3>
            {[{icon: <User size={20} />, label: "Name", value: "John Doe"},{icon: <Building size={20} />, label: "Company", value: "Tech Solutions Inc."},{icon: <Mail size={20} />, label: "Email", value: "john@techsolutions.com"}].map((i, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-3">
                <div className="text-gray-400">{i.icon}</div>
                <div><div className="text-sm text-gray-600">{i.label}</div><div className="font-semibold">{i.value}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}