"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check } from "lucide-react";
import { getGroups, addGroup, updateGroup, deleteGroup, Group } from "@/lib/storage";

type Props = {
  onClose: () => void;
  onGroupsChanged: () => void;
};

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#94a3b8", // Slate
];

export default function GroupManager({ onClose, onGroupsChanged }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    setGroups(getGroups());
  }, []);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    addGroup({
      name: newGroupName.trim(),
      color: selectedColor,
    });
    setNewGroupName("");
    setGroups(getGroups());
    onGroupsChanged();
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm("Are you sure you want to delete this group? Contacts will be unassigned but not deleted.")) {
      deleteGroup(id);
      setGroups(getGroups());
      onGroupsChanged();
    }
  };

  const startEdit = (group: Group) => {
    setEditingGroupId(group.id);
    setEditName(group.name);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateGroup(id, { name: editName.trim() });
    setEditingGroupId(null);
    setGroups(getGroups());
    onGroupsChanged();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Manage Groups</h2>

          {/* Create New Group */}
          <form onSubmit={handleCreateGroup} className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="label-text">Create New Group</label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name (e.g. VIP Clients)"
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={!newGroupName.trim()}
                className="glass-button flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> Add Group
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </form>

          {/* Group List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Existing Groups</h3>
            {groups.length === 0 ? (
              <p className="text-center py-8 text-slate-500 italic">No groups created yet.</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: group.color }}
                    />
                    {editingGroupId === group.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveEdit(group.id)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(group.id)}
                        autoFocus
                        className="bg-transparent border-b border-blue-500 outline-none text-white w-full py-0.5"
                      />
                    ) : (
                      <span className="text-slate-200 font-medium">{group.name}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(group)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      title="Rename"
                    >
                      <Plus size={16} className="rotate-45" /> {/* Using Plus rotated as placeholder for Edit if needed, but let's keep it simple */}
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 px-6 py-2 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
