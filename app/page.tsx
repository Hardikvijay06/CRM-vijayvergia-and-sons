"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, BookUser, TrendingUp, Activity } from "lucide-react";
import { getContacts } from "@/lib/storage";

export default function Dashboard() {
  const [contactsCount, setContactsCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    const contacts = getContacts();
    setContactsCount(contacts.length);
    setLeadsCount(contacts.filter(c => c.status === "Lead").length);
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl text-gradient font-bold mt-0">CRM Dashboard</h1>
        <Link href="/contacts">
          <button className="glass-button flex items-center gap-2 font-medium">
            <Users size={18} />
            View Contacts
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <BookUser size={24} />
            </div>
            <h2 className="text-xl font-semibold mt-0">Total Contacts</h2>
          </div>
          <p className="text-4xl font-bold mt-0">{contactsCount}</p>
        </div>
        
        <div className="glass-panel p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-pink-500/20 rounded-lg text-pink-400">
              <TrendingUp size={24} />
            </div>
            <h2 className="text-xl font-semibold mt-0">Active Leads</h2>
          </div>
          <p className="text-4xl font-bold mt-0">{leadsCount}</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Activity size={24} />
            </div>
            <h2 className="text-xl font-semibold mt-0">System Status</h2>
          </div>
          <p className="text-xl font-medium text-emerald-400 mt-0">Healthy (Offline)</p>
        </div>
      </div>

      <div className="glass-panel p-8">
        <h2 className="text-2xl font-bold mb-6 mt-0">Welcome to Your Independent CRM</h2>
        <p className="text-slate-300 leading-relaxed max-w-2xl mb-6 mt-0">
          This industry-grade CRM allows you to manage your customer relationships locally. 
          All data is securely saved to your browser without requiring a backend database, making this a lightning-fast, highly portable static site!
        </p>
        <Link href="/contacts">
          <button className="glass-button font-medium">Get Started</button>
        </Link>
      </div>
    </div>
  );
}
