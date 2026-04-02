/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, UserCircle, Briefcase, Mail, Phone, UserPlus, Download, LayoutDashboard, Users, Kanban } from "lucide-react";
import { getContacts, Contact } from "@/lib/storage";
import { exportToCSV } from "@/lib/export";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setContacts(getContacts());
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const staticCommands = [
    { id: 'cmd-dashboard', name: 'Go to Dashboard', icon: LayoutDashboard, action: 'goto', path: '/' },
    { id: 'cmd-contacts', name: 'Go to Contacts', icon: Users, action: 'goto', path: '/contacts' },
    { id: 'cmd-pipeline', name: 'Go to Pipeline', icon: Kanban, action: 'goto', path: '/pipeline' },
    { id: 'cmd-add', name: 'Add New Contact', icon: UserPlus, action: 'add' },
    { id: 'cmd-export', name: 'Export Contacts', icon: Download, action: 'export' },
  ];

  let filteredCommands: typeof staticCommands = [];
  let filteredContacts: typeof contacts = [];
  
  const searchStr = query.toLowerCase();
  let cleanSearch = searchStr;
  
  if (searchStr.startsWith('>')) {
    cleanSearch = searchStr.slice(1).trim();
    filteredCommands = staticCommands.filter(c => c.name.toLowerCase().includes(cleanSearch));
  } else {
    filteredCommands = staticCommands.filter(c => c.name.toLowerCase().includes(searchStr));
    filteredContacts = contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(searchStr) ||
        (contact.email && contact.email.toLowerCase().includes(searchStr)) ||
        (contact.company && contact.company.toLowerCase().includes(searchStr)) ||
        (contact.phone && contact.phone.toLowerCase().includes(searchStr)) ||
        (contact.status && contact.status.toLowerCase().includes(searchStr))
      );
    });
  }

  const allItems = [...filteredCommands, ...filteredContacts];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    if (item.action === "goto") {
      router.push(item.path);
    } else if (item.action === "add") {
      if (window.location.pathname === "/contacts") {
        window.dispatchEvent(new CustomEvent("openNewContact"));
      } else {
        router.push("/contacts?action=new");
      }
    } else if (item.action === "export") {
      exportToCSV(contacts);
    } else {
      if (window.location.pathname === "/contacts") {
        window.dispatchEvent(new CustomEvent("openContact", { detail: item.id }));
      } else {
        router.push(`/contacts?edit=${item.id}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === "Enter" && allItems.length > 0) {
      e.preventDefault();
      handleSelect(allItems[selectedIndex]);
    }
  };

  const HighlightMatch = ({ text, search }: { text: string | null; search: string }) => {
    if (!text) return null;
    if (!search) return <span>{text}</span>;
    
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <span key={i} className="text-blue-400 font-bold bg-blue-500/10 rounded px-0.5">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="glass-panel w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-700/50">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-slate-500"
            placeholder="Search contacts or type '>' for commands (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5" title="Press Escape to close">
            ESC
          </div>
        </div>
        
        {allItems.length > 0 ? (
          <div className="overflow-y-auto p-2" style={{ maxHeight: "calc(70vh - 60px)" }}>
            {allItems.map((item: any, index) => {
              if (item.action) {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex flex-col p-3 rounded-lg cursor-pointer transition-colors ${
                      index === selectedIndex ? "bg-slate-700/50" : "hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center text-white font-medium">
                      <Icon size={16} className="text-emerald-400 mr-2" />
                      <HighlightMatch text={item.name} search={cleanSearch} />
                    </div>
                  </div>
                );
              }
              const contact = item as Contact;
              return (
              <div 
                key={contact.id}
                onClick={() => handleSelect(contact)}
                className={`flex flex-col p-3 rounded-lg cursor-pointer transition-colors ${
                  index === selectedIndex ? "bg-slate-700/50" : "hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center text-white font-medium">
                    <UserCircle size={16} className="text-blue-400 mr-2" />
                    <HighlightMatch text={contact.name} search={cleanSearch} />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    contact.status === "Lead" ? "bg-blue-500/20 text-blue-300" :
                    contact.status === "Active" ? "bg-emerald-500/20 text-emerald-300" :
                    "bg-slate-500/20 text-slate-300"
                  }`}>
                    {contact.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap text-sm text-slate-400 gap-x-4 gap-y-1 mt-1">
                  {contact.email && (
                    <div className="flex items-center">
                      <Mail size={12} className="mr-1.5 opacity-70" />
                      <HighlightMatch text={contact.email} search={cleanSearch} />
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center">
                      <Briefcase size={12} className="mr-1.5 opacity-70" />
                      <HighlightMatch text={contact.company} search={cleanSearch} />
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center">
                      <Phone size={12} className="mr-1.5 opacity-70" />
                      <HighlightMatch text={contact.phone} search={cleanSearch} />
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
            <Search size={32} className="mb-3 opacity-20" />
            <p>No results found for &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
