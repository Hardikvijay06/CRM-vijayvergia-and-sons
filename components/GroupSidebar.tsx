"use client";

import { Users, LayoutGrid, Settings2, Plus } from "lucide-react";
import { Group } from "@/lib/storage";

type Props = {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
  onManageGroups: () => void;
};

export default function GroupSidebar({ groups, selectedGroupId, onSelectGroup, onManageGroups }: Props) {
  return (
    <div className="w-64 shrink-0 flex flex-col gap-6 sticky top-8 h-fit">
      <div className="glass-panel p-4 flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Filters</h2>
        
        <button
          onClick={() => onSelectGroup(null)}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${
            selectedGroupId === null
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
          }`}
        >
          <LayoutGrid size={18} />
          <span className="font-medium text-sm">All Contacts</span>
        </button>

        <div className="h-px bg-slate-800/50 my-2 mx-2" />

        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Groups</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onManageGroups}
              className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
              title="Add Group"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={onManageGroups}
              className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
              title="Manage Groups"
            >
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto custom-scrollbar">
          {groups.length === 0 ? (
            <div className="px-3 py-4 text-center rounded-lg border border-dashed border-slate-700/50">
              <p className="text-xs text-slate-500">No groups yet.</p>
              <button
                onClick={onManageGroups}
                className="text-xs text-blue-400 hover:underline mt-1"
              >
                Create one
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all group ${
                  selectedGroupId === group.id
                    ? "bg-slate-800/80 text-white border border-white/10 shadow-lg"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_5px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: group.color, boxShadow: `0 0 8px ${group.color}40` }}
                />
                <span className="font-medium text-sm truncate">{group.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="glass-panel p-4 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 border-indigo-500/20">
        <h3 className="text-xs font-bold text-indigo-300 uppercase mb-2">Pro Tip</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Use groups to segment your leads and focus on high-priority prospects first.
        </p>
      </div>
    </div>
  );
}
