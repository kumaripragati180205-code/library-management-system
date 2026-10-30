import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw 
} from 'lucide-react';

export default function LoansView({ 
  loans, 
  onIssueClick, 
  onReturnBook, 
  onRenewLoan, 
  onPayFine 
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const matchSearch = 
        !searchQuery.trim() ||
        l.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.member_card_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.book_isbn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && l.status === 'BORROWED') ||
        l.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [loans, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Control Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search loans by book title, member name, or card #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
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

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'ACTIVE', label: 'Active Loans' },
            { id: 'OVERDUE', label: 'Overdue Only' },
            { id: 'RETURNED', label: 'Returned History' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? f.id === 'OVERDUE'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Issue Book CTA */}
        <button
          onClick={onIssueClick}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all whitespace-nowrap active:scale-95"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Checkout</span>
        </button>

      </div>

      {/* Loans Table / Cards */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
          <ArrowLeftRight className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No circulation records found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try switching filter tabs or check out a book to a library member.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Issued On</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Fine</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredLoans.map(loan => {
                  const isOverdue = loan.status === 'OVERDUE';
                  const isReturned = loan.status === 'RETURNED';

                  return (
                    <tr 
                      key={loan.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Book */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={loan.book_cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'}
                            alt=""
                            className="w-9 h-12 rounded object-cover shadow-sm bg-slate-950"
                          />
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1 max-w-xs" title={loan.book_title}>
                              {loan.book_title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ISBN: {loan.book_isbn}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Member */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-200">
                            {loan.member_name}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono">
                            {loan.member_card_number}
                          </div>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{loan.issue_date}</span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className={`flex items-center gap-1.5 font-semibold ${
                            isOverdue ? 'text-rose-400' : 'text-slate-200'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{loan.due_date}</span>
                          </div>
                          {isOverdue && loan.days_overdue > 0 && (
                            <div className="text-[10px] text-rose-400 font-bold mt-0.5">
                              {loan.days_overdue} days late
                            </div>
                          )}
                          {isReturned && loan.return_date && (
                            <div className="text-[10px] text-emerald-400 mt-0.5">
                              Returned on {loan.return_date}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isReturned
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isOverdue
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                          {isReturned ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Returned</span>
                            </>
                          ) : isOverdue ? (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Overdue</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Borrowed</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Fine */}
                      <td className="py-3.5 px-4">
                        {loan.fine_amount > 0 ? (
                          <div>
                            <span className="font-bold text-rose-400">
                              ${Number(loan.fine_amount).toFixed(2)}
                            </span>
                            <div className="text-[10px]">
                              {loan.fine_paid ? (
                                <span className="text-emerald-400">Paid</span>
                              ) : (
                                <button
                                  onClick={() => onPayFine(loan.id)}
                                  className="text-amber-400 hover:underline font-semibold"
                                >
                                  Settle Fine
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">$0.00</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!isReturned ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onReturnBook(loan.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 transition-all flex items-center gap-1"
                              title="Mark book as returned and restore inventory"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Return</span>
                            </button>

                            <button
                              onClick={() => onRenewLoan(loan.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              title="Extend loan deadline by 14 days"
                            >
                              <span>+14d</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs italic">Closed</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
