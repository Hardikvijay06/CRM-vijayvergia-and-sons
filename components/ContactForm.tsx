"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { addContact, updateContact, Contact } from "@/lib/storage";

type Props = {
  contact?: Contact | null;
  onClose: () => void;
  onSaved: (contact: Contact) => void;
};

export default function ContactForm({ contact, onClose, onSaved }: Props) {
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    status: contact?.status || "Lead",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate network delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let savedContact;
      if (contact) {
        savedContact = updateContact(contact.id, formData);
      } else {
        savedContact = addContact(formData);
      }

      onSaved(savedContact);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {contact ? "Edit Contact" : "New Contact"}
            </h2>
            {error && <p className="text-rose-400 text-sm">{error}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-text">Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="label-text">Email Address <span className="text-slate-500 font-normal">(Optional)</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="john@example.com"
              />
              <p className="text-xs text-slate-400 mt-1">
                No email compulsion. Leave blank if unknown.
              </p>
            </div>

            <div>
              <label className="label-text">Phone Number <span className="text-slate-500 font-normal">(Optional)</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="label-text">Company <span className="text-slate-500 font-normal">(Optional)</span></label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input-field"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label className="label-text">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field appearance-none bg-slate-800/80"
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-button w-24 flex justify-center"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
