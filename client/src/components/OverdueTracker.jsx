import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  Mail, 
  Phone, 
  DollarSign, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

export default function OverdueTracker({ overdueLoans, onReturnBook, onPayFine, onSendReminder }) {
  const totalFines = overdueLoans.reduce((sum, l) => sum + (Number(l.fine_amount) || 0), 0);
  const distinctMembers = new Set(overdueLoans.map(l => l.member_id)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Alert Banner / Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-300">Overdue Books</div>
            <div className="text-3xl font-extrabold text-rose-400 mt-1">{overdueLoans.length}</div>
            <div className="text-xs text-rose-300/80 mt-1">Requires immediate librarian action</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Total Unpaid Fines</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">${totalFines.toFixed(2)}</div>
            <div className="text-xs text-amber-300/80 mt-1">Accumulated at $0.75 / day overdue</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Delinquent Patrons</div>
            <div className="text-3xl font-extrabold text-slate-100 mt-1">{distinctMembers}</div>
            <div className="text-xs text-slate-400 mt-1">Members with unreturned books</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
            <Clock className="w-8 h-8" />
          </div>
        </div>

      </div>

      {/* Overdue Items List */}
      {overdueLoans.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">All Clear! No Overdue Books</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Every currently checked-out book is on schedule within its allowed loan period.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Action Required ({overdueLoans.length} Loans)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Rate: $0.75 / day late</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {overdueLoans.map(loan => (
              <div 
                key={loan.id}
                className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                {/* Book & Author info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={loan.book_cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'}
                    alt=""
                    className="w-12 h-16 rounded-lg object-cover shadow-md bg-slate-950 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {loan.book_title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                        {loan.book_isbn}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      by <span className="text-slate-300 font-medium">{loan.author_name}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Returns to: Shelf {loan.book_shelf || 'A-1'}</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>Issued: {loan.issue_date}</span>
                    </div>
                  </div>
                </div>

                {/* Member Contact info */}
                <div className="lg:w-64 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-200">
                    {loan.member_name}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400">
                    {loan.member_card_number}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => onSendReminder && onSendReminder(loan)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                      title="Send Email Reminder"
                    >
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span className="truncate max-w-[110px]">{loan.member_email}</span>
                    </button>
                    {loan.member_phone && (
                      <a 
                        href={`tel:${loan.member_phone}`}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        title="Call Member"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Overdue Calculation & Days */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{loan.days_overdue} days overdue</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Due: <span className="font-semibold text-slate-300">{loan.due_date}</span>
                    </div>
                  </div>

                  {/* Accrued Fine */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-xs text-slate-400">Accrued Fine</div>
                    <div className="text-lg font-black text-rose-400">
                      ${Number(loan.fine_amount).toFixed(2)}
                    </div>
                    {loan.fine_amount > 0 && !loan.fine_paid && onPayFine && (
                      <button
                        onClick={() => onPayFine(loan.id)}
                        className="text-[10px] text-amber-400 hover:underline block font-semibold mt-0.5 ml-auto"
                      >
                        Settle Fine
                      </button>
                    )}
                  </div>

                  {/* Return & Settle Action */}
                  <button
                    onClick={() => onReturnBook(loan.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Process Return</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
