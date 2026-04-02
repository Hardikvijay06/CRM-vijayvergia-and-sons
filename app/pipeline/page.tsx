"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, LayoutDashboard, ArrowLeft, GripVertical } from "lucide-react";
import { getContacts, updateContact, Contact } from "@/lib/storage";

export default function PipelinePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setContacts(getContacts());
    setIsLoaded(true);
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("contactId", id);
    setDraggedId(id);
    
    // Make the drag image slightly transparent
    if (e.target instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.target, 20, 20);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData("contactId");
    
    if (contactId) {
      // Find and update the contact locally
      const updatedContacts = contacts.map(c => {
        if (c.id === contactId && c.status !== newStatus) {
          // Update in local storage
          updateContact(contactId, { status: newStatus });
          return { ...c, status: newStatus };
        }
        return c;
      });
      
      setContacts(updatedContacts);
    }
    setDraggedId(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin"></div>
      </div>
    );
  }

  const columns = [
    { id: "Lead", title: "Leads", color: "blue" },
    { id: "Active", title: "Active Clients", color: "emerald" },
    { id: "Inactive", title: "Inactive", color: "slate" },
  ];

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Sales Pipeline</h1>
          <p className="text-slate-400 text-sm">Drag and drop contacts to instantly update their status.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/contacts">
            <button className="glass-button secondary flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50">
              <Users size={18} />
              Directory
            </button>
          </Link>
          <Link href="/">
            <button className="glass-button flex items-center gap-2 px-4 py-2">
              <LayoutDashboard size={18} />
              Dashboard
            </button>
          </Link>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const columnContacts = contacts.filter(c => c.status === col.id);
          
          return (
            <div 
              key={col.id}
              className={`glass-panel flex flex-col h-full min-h-[500px] border-t-4 ${
                col.color === "blue" ? "border-t-blue-500" : 
                col.color === "emerald" ? "border-t-emerald-500" : 
                "border-t-slate-500"
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                <h2 className="font-semibold text-white">{col.title}</h2>
                <span className="bg-slate-800 text-slate-300 text-xs py-1 px-2 rounded-full font-medium border border-slate-700/50">
                  {columnContacts.length}
                </span>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {columnContacts.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm italic p-4 text-center border-2 border-dashed border-slate-700/30 rounded-lg">
                    Drop contacts here
                  </div>
                )}
                
                {columnContacts.map(contact => (
                  <div 
                    key={contact.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-slate-800/80 hover:bg-slate-700/80 p-4 rounded-lg border border-slate-700/50 shadow-sm cursor-grab active:cursor-grabbing transition-colors ${
                      draggedId === contact.id ? "opacity-50 border-dashed border-blue-500/50" : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <GripVertical size={16} className="text-slate-500 mr-2 mt-1 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{contact.name}</h3>
                        {contact.company && (
                          <p className="text-slate-400 text-sm truncate mt-0.5">{contact.company}</p>
                        )}
                        <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                          <span className={`text-xs ${contact.email ? 'text-slate-300' : 'text-slate-500 truncate'}`}>
                            {contact.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
