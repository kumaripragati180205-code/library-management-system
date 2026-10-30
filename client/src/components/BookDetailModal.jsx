import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';

export default function BookDetailModal({ bookId, onClose, onIssueBook }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    fetch(`/api/books/${bookId}`)
      .then(r => r.json())
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [bookId]);

  if (!bookId) return null;

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
          <div className="py-20 text-center text-slate-400">Loading Book Record...</div>
        ) : !book ? (
          <div className="py-20 text-center text-rose-400">Book record not found.</div>
        ) : (
          <div className="space-y-6">
            
            {/* Top Overview */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'}
                alt={book.title}
                className="w-32 h-44 rounded-2xl object-cover shadow-2xl bg-slate-950 shrink-0 border border-slate-800"
              />
              <div className="flex-1">
                <span 
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white mb-2 inline-block shadow-sm"
                  style={{ backgroundColor: book.category_color || '#3b82f6' }}
                >
                  {book.category_name}
                </span>

                <h2 className="text-xl font-extrabold text-white leading-snug">{book.title}</h2>
                <div className="text-xs text-slate-400 mt-1">
                  written by <span className="text-amber-400 font-semibold">{book.author_name}</span>
                  {book.author_nationality && <span> ({book.author_nationality})</span>}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block">ISBN</span>
                    {book.isbn}
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block">Shelf Location</span>
                    {book.shelf_location || 'A-101'}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="text-xs font-semibold">
                    <span className={book.available_copies > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {book.available_copies} of {book.total_copies} available
                    </span>
                  </div>

                  {book.available_copies > 0 && (
                    <button
                      onClick={() => {
                        onClose();
                        onIssueBook(book);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Issue Copy</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Author Bio Box */}
            {book.author_bio && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  About Author: {book.author_name}
                </span>
                <p className="text-slate-400 leading-relaxed">{book.author_bio}</p>
              </div>
            )}

            {/* Synopsis */}
            {book.description && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Synopsis</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Relational Loans History */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Borrowing History & Active Loans ({book.loans?.length || 0})</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Table: book_loans</span>
              </div>

              {(!book.loans || book.loans.length === 0) ? (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                  No member borrow records found for this title yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {book.loans.map(loan => (
                    <div 
                      key={loan.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">
                          {loan.member_name} <span className="text-amber-400 font-mono text-[11px]">({loan.card_number})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Issued: {loan.issue_date} • Due: {loan.due_date}
                          {loan.return_date && <span> • Returned: {loan.return_date}</span>}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        loan.status === 'RETURNED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : loan.status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-400 animate-pulse'
                          : 'bg-sky-500/10 text-sky-400'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
