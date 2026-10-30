import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  CreditCard, 
  Mail, 
  Phone, 
  BookOpen, 
  Edit3, 
  Trash2, 
  ShieldAlert 
} from 'lucide-react';

export default function MembersView({ 
  members, 
  onSelectMember, 
  onEditMember, 
  onDeleteMember, 
  onAddMember 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = 
        !searchQuery.trim() ||
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.card_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.phone && m.phone.includes(searchQuery));

      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [members, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search members by name, card number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          {['ALL', 'ACTIVE', 'SUSPENDED', 'EXPIRED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Register Member Button */}
        <button
          onClick={onAddMember}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all whitespace-nowrap active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Register Member</span>
        </button>

      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No members found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting search terms or register a new library member.
          </p>
          <button
            onClick={onAddMember}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Register New Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map(member => {
            const hasOverdue = member.overdue_loans_count > 0;
            const quotaPercent = Math.round((member.active_loans_count / member.max_borrow_limit) * 100);

            return (
              <div
                key={member.id}
                className="group bg-slate-900/80 rounded-2xl border border-slate-800/80 p-5 hover:border-purple-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Card # & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs font-medium text-slate-300">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>{member.card_number}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : member.status === 'SUSPENDED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {member.status}
                    </span>
                  </div>

                  {/* Member Name & Contact */}
                  <h3 
                    onClick={() => onSelectMember(member)}
                    className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    {member.full_name}
                  </h3>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Overdue alert notice */}
                  {hasOverdue && (
                    <div className="mt-3 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{member.overdue_loans_count} overdue book(s) on loan</span>
                    </div>
                  )}

                  {member.unpaid_fines > 0 && (
                    <div className="mt-2 text-[11px] font-semibold text-rose-400">
                      Unpaid fines: ${Number(member.unpaid_fines).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Quota & Action Bar */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>Borrow Limit</span>
                    </span>
                    <span className="font-semibold text-slate-300">
                      {member.active_loans_count} / {member.max_borrow_limit} books
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        quotaPercent >= 100 ? 'bg-rose-500' : quotaPercent >= 60 ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectMember(member)}
                      className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View History</span>
                    </button>

                    <button
                      onClick={() => onEditMember(member)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Edit Member"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteMember(member)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
