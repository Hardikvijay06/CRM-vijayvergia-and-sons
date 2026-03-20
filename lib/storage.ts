"use client";

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  createdAt: string;
};

const STORAGE_KEY = "crm_contacts";

export const getContacts = (): Contact[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveContacts = (contacts: Contact[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }
};

export const addContact = (contact: Omit<Contact, "id" | "createdAt">): Contact => {
  const contacts = getContacts();
  const newContact: Contact = {
    ...contact,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveContacts([newContact, ...contacts]);
  return newContact;
};

export const updateContact = (id: string, updates: Partial<Contact>): Contact => {
  const contacts = getContacts();
  let updatedContact: Contact | null = null;
  
  const newContacts = contacts.map(c => {
    if (c.id === id) {
      updatedContact = { ...c, ...updates };
      return updatedContact;
    }
    return c;
  });

  if (!updatedContact) throw new Error("Contact not found");
  saveContacts(newContacts);
  return updatedContact;
};

export const deleteContact = (id: string) => {
  const contacts = getContacts();
  saveContacts(contacts.filter(c => c.id !== id));
};
