"use client";

import { useState, useEffect } from "react";
import { UserPlus, Pencil, Trash2, AlertTriangle, Download, FolderInput } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import GroupSidebar from "@/components/GroupSidebar";
import GroupManager from "@/components/GroupManager";
import { getContacts, deleteContact, getGroups, updateContact, Contact, Group } from "@/lib/storage";
import { exportToCSV } from "@/lib/export";

export default function ContactsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
  
  useEffect(() => {
    setContacts(getContacts());
    setGroups(getGroups());
    setIsLoaded(true);
  }, []);

  const refreshData = () => {
    setContacts(getContacts());
    setGroups(getGroups());
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Check URL to see if we navigated here via search
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("edit");
      const action = params.get("action");
      if (editId) {
        const contactToEdit = contacts.find((c) => c.id === editId);
        if (contactToEdit) {
          setEditingContact(contactToEdit);
          setIsFormOpen(true);
          window.history.replaceState({}, "", "/contacts");
        }
      } else if (action === "new") {
        setEditingContact(null);
        setIsFormOpen(true);
        window.history.replaceState({}, "", "/contacts");
      }
    }
  }, [contacts, isLoaded]);

  // Listen for custom event when already on this page
  useEffect(() => {
    const handleOpenNewContact = () => openNewForm();
    window.addEventListener("openNewContact", handleOpenNewContact);
    return () => window.removeEventListener("openNewContact", handleOpenNewContact);
  }, []);

  // Listen for custom event when already on this page
  useEffect(() => {
    const handleOpenContact = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const contactToEdit = contacts.find((c) => c.id === customEvent.detail);
      if (contactToEdit) {
        setEditingContact(contactToEdit);
        setIsFormOpen(true);
      }
    };

    window.addEventListener("openContact", handleOpenContact);
    return () => window.removeEventListener("openContact", handleOpenContact);
  }, [contacts]);
  
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const confirmBulkDelete = () => setShowBulkDeleteConfirm(true);

  const executeBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      selectedIds.forEach(id => deleteContact(id));
      setContacts(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error(error);
      alert("Error deleting contacts");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaved = (savedContact: Contact) => {
    refreshData();
    setIsFormOpen(false);
  };

  const handleMoveToGroup = (groupId: string) => {
    selectedIds.forEach(id => {
      updateContact(id, { groupId: groupId || undefined });
    });
    refreshData();
    setSelectedIds([]);
  };

  const filteredContacts = selectedGroupId 
    ? contacts.filter(c => c.groupId === selectedGroupId)
    : contacts;

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gradient">Contacts Directory</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => exportToCSV(contacts)} className="glass-button flex items-center gap-2">
            <Download size={18} />
            Export All
          </button>
          <button onClick={openNewForm} className="glass-button flex items-center gap-2">
            <UserPlus size={18} />
            Add Contact
          </button>
        </div>
      </header>

      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg flex items-center justify-between border border-blue-500/20">
          <span className="text-sm font-medium text-slate-300">{selectedIds.length} contact(s) selected</span>
          <div className="flex gap-2">
            <div className="relative group">
              <button className="px-3 py-1.5 glass-button text-sm flex items-center gap-2">
                <FolderInput size={14} /> Move to Group
              </button>
              <div className="absolute bottom-full left-0 mb-2 w-48 glass-panel hidden group-hover:block z-10 shadow-xl overflow-hidden border-blue-500/30">
                <div className="py-1 max-h-48 overflow-y-auto">
                  <button 
                    onClick={() => handleMoveToGroup("")}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                  >
                    No Group
                  </button>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleMoveToGroup(g.id)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                const selected = contacts.filter(c => selectedIds.includes(c.id));
                exportToCSV(selected);
              }}
              className="px-3 py-1.5 glass-button text-sm flex items-center gap-2"
            >
              <Download size={14} /> Export Selected
            </button>
            <button 
              onClick={confirmBulkDelete}
              className="px-3 py-1.5 glass-button danger text-sm flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        <GroupSidebar 
          groups={groups} 
          selectedGroupId={selectedGroupId} 
          onSelectGroup={setSelectedGroupId}
          onManageGroups={() => setIsGroupManagerOpen(true)}
        />
        
        <div className="flex-1 glass-panel overflow-x-auto min-h-[400px]">
          {!isLoaded ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-rose-500/20 border-t-rose-400 animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left transition-all duration-300">
              <thead>
                <tr>
                  <th className="w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-600 bg-slate-800/50 accent-blue-500"
                      checked={filteredContacts.length > 0 && selectedIds.length === filteredContacts.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredContacts.map(c => c.id));
                        else setSelectedIds([]);
                      }}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      {selectedGroupId 
                        ? "No contacts in this group." 
                        : 'No contacts found. Click "Add Contact" to create one.'}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className={selectedIds.includes(contact.id) ? "bg-slate-800/30" : ""}>
                      <td className="w-12 text-center">
                        <input 
                          type="checkbox"
                          className="rounded border-slate-600 bg-slate-800/50 accent-blue-500"
                          checked={selectedIds.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, contact.id]);
                            else setSelectedIds(selectedIds.filter(id => id !== contact.id));
                          }}
                        />
                      </td>
                      <td className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{contact.name}</span>
                          {contact.groupId && groups.find(g => g.id === contact.groupId) && (
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: groups.find(g => g.id === contact.groupId)?.color }}
                              title={groups.find(g => g.id === contact.groupId)?.name}
                            />
                          )}
                        </div>
                      </td>
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
      </div>

      {isFormOpen && (
        <ContactForm 
          contact={editingContact} 
          onClose={() => setIsFormOpen(false)} 
          onSaved={handleSaved} 
        />
      )}

      {isGroupManagerOpen && (
        <GroupManager 
          onClose={() => setIsGroupManagerOpen(false)} 
          onGroupsChanged={refreshData}
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
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowBulkDeleteConfirm(false)}
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
              <h2 className="text-2xl font-bold mb-3 text-white">Delete {selectedIds.length} Contacts?</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                You are about to permanently delete <strong className="text-white">{selectedIds.length} contacts</strong>. 
                This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={executeBulkDelete}
                  disabled={isDeleting}
                  className="glass-button danger flex items-center justify-center min-w-[120px] font-semibold py-2.5"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete All"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
