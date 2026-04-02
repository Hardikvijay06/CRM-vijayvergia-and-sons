"use client";

export type Group = {
  id: string;
  name: string;
  color: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  groupId?: string;
  createdAt: string;
};

const STORAGE_KEY = "crm_contacts";
const GROUPS_KEY = "crm_groups";

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

// --- Groups Functions ---

export const getGroups = (): Group[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(GROUPS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveGroups = (groups: Group[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }
};

export const addGroup = (group: Omit<Group, "id">): Group => {
  const groups = getGroups();
  const newGroup: Group = {
    ...group,
    id: crypto.randomUUID(),
  };
  saveGroups([...groups, newGroup]);
  return newGroup;
};

export const updateGroup = (id: string, updates: Partial<Group>): Group => {
  const groups = getGroups();
  let updatedGroup: Group | null = null;
  
  const newGroups = groups.map(g => {
    if (g.id === id) {
      updatedGroup = { ...g, ...updates };
      return updatedGroup;
    }
    return g;
  });

  if (!updatedGroup) throw new Error("Group not found");
  saveGroups(newGroups);
  return updatedGroup;
};

export const deleteGroup = (id: string) => {
  const groups = getGroups();
  saveGroups(groups.filter(g => g.id !== id));
  
  // Unassign contacts from this group
  const contacts = getContacts();
  const updatedContacts = contacts.map(c => {
    if (c.groupId === id) {
      const { groupId, ...rest } = c;
      return rest;
    }
    return c;
  });
  saveContacts(updatedContacts as Contact[]);
};
