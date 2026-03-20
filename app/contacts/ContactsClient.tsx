"use client";

import { useState, useEffect } from "react";
import { UserPlus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { getContacts, deleteContact, Contact } from "@/lib/storage";

export default function ContactsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setContacts(getContacts());
    setIsLoaded(true);
  }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Delete confirmation state
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (contact: Contact) => {
    setContactToDelete(contact);
  };

  const executeDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    
    try {
      // Simulate brief network delay for UX
      await new Promise(resolve => setTimeout(resolve, 400));
      deleteContact(contactToDelete.id);
      setContacts((prev) => prev.filter((c) => c.id !== contactToDelete.id));
      setContactToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Error deleting contact");
    } finally {
      setIsDeleting(false);
    }
  };

  const openNewForm = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const openEditForm = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleSaved = (savedContact: Contact) => {
    if (editingContact) {
      setContacts((prev) => prev.map((c) => (c.id === savedContact.id ? savedContact : c)));
    } else {
      setContacts([savedContact, ...contacts]);
    }
    setIsFormOpen(false);
  };

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gradient">Contacts Directory</h1>
        <button onClick={openNewForm} className="glass-button flex items-center gap-2">
          <UserPlus size={18} />
          Add Contact
        </button>
      </header>

      <div className="glass-panel overflow-x-auto min-h-[400px]">
        {!isLoaded ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/20 border-t-rose-400 animate-spin"></div>
          </div>
        ) : (
          <table className="w-full text-left transition-all duration-300">
            <thead>
              <tr>
                <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  No contacts found. Click "Add Contact" to create one.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="font-medium text-white">{contact.name}</td>
                  <td className={contact.email ? "text-slate-300" : "text-slate-500 italic"}>
                    {contact.email || "Not provided"}
                  </td>
                  <td className="text-slate-300">{contact.phone || "-"}</td>
                  <td className="text-slate-300">{contact.company || "-"}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        contact.status === "Lead"
                          ? "bg-blue-500/20 text-blue-300"
                          : contact.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => openEditForm(contact)} 
                        className="glass-button flex items-center gap-2 text-sm py-1.5 px-3"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => confirmDelete(contact)} 
                        className="glass-button danger flex items-center gap-2 text-sm py-1.5 px-3 font-semibold"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <ContactForm 
          contact={editingContact} 
          onClose={() => setIsFormOpen(false)} 
          onSaved={handleSaved} 
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {contactToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setContactToDelete(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="glass-panel w-full max-w-sm relative p-8 text-center"
              style={{ boxShadow: "0 25px 50px -12px rgba(244, 63, 94, 0.25)" }}
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-6 border border-rose-500/20"
                   style={{ boxShadow: "0 0 20px rgba(244, 63, 94, 0.2)" }}
              >
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Delete Contact?</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                You are about to permanently delete <strong className="text-white">{contactToDelete.name}</strong>. 
                This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setContactToDelete(null)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="glass-button danger flex items-center justify-center min-w-[120px] font-semibold py-2.5"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
