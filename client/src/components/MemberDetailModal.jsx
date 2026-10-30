import React, { useState, useEffect, useCallback } from 'react';
import { X, CreditCard, Mail, Phone, BookOpen, RotateCcw } from 'lucide-react';

export default function MemberDetailModal({ memberId, onClose, onReturnBook }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMember = useCallback(() => {
    if (!memberId) return;
    setLoading(true);
    fetch(`/api/members/${memberId}`)
      .then(r => r.json())
      .then(data => {
        setMember(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading Member Profile...</div>
        ) : !member ? (
          <div className="py-20 text-center text-rose-400">Member not found.</div>
        ) : (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-600/20 shrink-0">
                {member.full_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {member.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-amber-400">
                    <CreditCard className="w-3.5 h-3.5" />
                    {member.card_number}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {member.email}
                  </span>
                  {member.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {member.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Active Loans</span>
                <span className="text-xl font-extrabold text-white">
                  {member.active_loans_count} / {member.max_borrow_limit}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Overdue Items</span>
                <span className={`text-xl font-extrabold ${member.overdue_loans_count > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {member.overdue_loans_count}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Unpaid Fines</span>
                <span className={`text-xl font-extrabold ${member.unpaid_fines > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  ${Number(member.unpaid_fines).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Loans History */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Loans & Borrowing History ({member.loans?.length || 0})</span>
              </h4>

              {(!member.loans || member.loans.length === 0) ? (
                <div className="text-xs text-slate-500 italic p-4 bg-slate-950/40 rounded-xl text-center">
                  No borrow records found for this member.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {member.loans.map(loan => {
                    const isOverdue = loan.status === 'OVERDUE';
                    const isReturned = loan.status === 'RETURNED';

                    return (
                      <div 
                        key={loan.id}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={loan.book_cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'}
                            alt=""
                            className="w-10 h-14 rounded object-cover shadow-sm bg-slate-900"
                          />
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1">{loan.book_title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              by {loan.author_name}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Issued: {loan.issue_date} • Due: {loan.due_date}
                              {loan.return_date && <span className="text-emerald-400"> • Returned: {loan.return_date}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isReturned
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isOverdue
                              ? 'bg-rose-500/10 text-rose-400 animate-pulse'
                              : 'bg-sky-500/10 text-sky-400'
                          }`}>
                            {loan.status}
                          </span>

                          {!isReturned && (
                            <button
                              onClick={() => {
                                onReturnBook(loan.id);
                                fetchMember();
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Return</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
