import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, BookOpen, User, Calendar, AlertCircle } from 'lucide-react';

export default function IssueModal({ isOpen, onClose, books, members, preselectedBook, onIssueSuccess }) {
  const [bookId, setBookId] = useState(preselectedBook ? preselectedBook.id : '');
  const [memberId, setMemberId] = useState('');
  const [duration, setDuration] = useState('14');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (preselectedBook) {
      setBookId(preselectedBook.id);
    } else if (books.length > 0) {
      const firstAvail = books.find(b => b.available_copies > 0);
      if (firstAvail) setBookId(firstAvail.id);
    }
  }, [isOpen, preselectedBook, books]);

  if (!isOpen) return null;

  const selectedBook = books.find(b => b.id === Number(bookId));
  const selectedMember = members.find(m => m.id === Number(memberId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!bookId) {
      setError('Please select a book to issue.');
      return;
    }
    if (!memberId) {
      setError('Please select a library member.');
      return;
    }

    if (selectedBook && selectedBook.available_copies <= 0) {
      setError('Selected book has no available copies on shelf.');
      return;
    }

    if (selectedMember && selectedMember.status !== 'ACTIVE') {
      setError(`Cannot issue book: Member status is ${selectedMember.status}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/loans/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: Number(bookId),
          member_id: Number(memberId),
          loan_duration_days: Number(duration),
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to issue book');
      } else {
        onIssueSuccess(data.message || 'Book issued successfully!');
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Issue Book Checkout</h2>
              <p className="text-xs text-slate-400">Record a loan transaction between Member & Book</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Select Book */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Book to Loan *</span>
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">-- Choose Book --</option>
              {books.map(b => (
                <option 
                  key={b.id} 
                  value={b.id} 
                  disabled={b.available_copies <= 0}
                >
                  {b.title} ({b.available_copies > 0 ? `${b.available_copies} available` : 'OUT OF STOCK'})
                </option>
              ))}
            </select>
          </div>

          {/* Select Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Select Library Member *</span>
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.card_number}) - {m.active_loans_count || 0}/{m.max_borrow_limit} borrowed
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Loan Duration</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '7 Days', val: '7' },
                { label: '14 Days (Standard)', val: '14' },
                { label: '30 Days', val: '30' }
              ].map(d => (
                <button
                  type="button"
                  key={d.val}
                  onClick={() => setDuration(d.val)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    duration === d.val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Librarian Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. In-library study room or special condition"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? 'Issuing...' : 'Complete Checkout'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
