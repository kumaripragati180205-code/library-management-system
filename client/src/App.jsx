import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import BooksView from './components/BooksView';
import MembersView from './components/MembersView';
import LoansView from './components/LoansView';
import OverdueTracker from './components/OverdueTracker';
import Toast from './components/Toast';

import IssueModal from './components/IssueModal';
import BookModal from './components/BookModal';
import MemberModal from './components/MemberModal';
import BookDetailModal from './components/BookDetailModal';
import MemberDetailModal from './components/MemberDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('books'); // books | members | loans | overdue

  // Core Data States
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [preselectedBook, setPreselectedBook] = useState(null);

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  const [detailBookId, setDetailBookId] = useState(null);
  const [detailMemberId, setDetailMemberId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Fetch all core datasets
  const fetchAllData = useCallback(async () => {
    try {
      const [bRes, mRes, lRes, oRes, aRes, cRes, sRes] = await Promise.all([
        fetch('/api/books').then(r => r.json()),
        fetch('/api/members').then(r => r.json()),
        fetch('/api/loans').then(r => r.json()),
        fetch('/api/loans/overdue').then(r => r.json()),
        fetch('/api/authors').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/stats').then(r => r.json())
      ]);

      setBooks(bRes || []);
      setMembers(mRes || []);
      setLoans(lRes || []);
      setOverdueLoans(oRes || []);
      setAuthors(aRes || []);
      setCategories(cRes || []);
      setStats(sRes || null);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Failed to load library data. Ensure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const [bRes, mRes, lRes, oRes, aRes, cRes, sRes] = await Promise.all([
          fetch('/api/books').then(r => r.json()),
          fetch('/api/members').then(r => r.json()),
          fetch('/api/loans').then(r => r.json()),
          fetch('/api/loans/overdue').then(r => r.json()),
          fetch('/api/authors').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/stats').then(r => r.json())
        ]);

        if (!ignore) {
          setBooks(bRes || []);
          setMembers(mRes || []);
          setLoans(lRes || []);
          setOverdueLoans(oRes || []);
          setAuthors(aRes || []);
          setCategories(cRes || []);
          setStats(sRes || null);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error loading initial data:', err);
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  // Return Book Action with confetti & transaction handling
  const handleReturnBook = async (loanId) => {
    try {
      const res = await fetch(`/api/loans/${loanId}/return`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to process return', 'error');
      } else {
        // Trigger celebratory confetti
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });

        if (data.fine > 0) {
          showToast(`Book returned! Late return fine of $${data.fine.toFixed(2)} recorded.`, 'info');
        } else {
          showToast(data.message || 'Book returned successfully on time!', 'success');
        }
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Renew Loan (+14 Days)
  const handleRenewLoan = async (loanId) => {
    try {
      const res = await fetch(`/api/loans/${loanId}/renew`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to renew loan', 'error');
      } else {
        showToast(data.message || 'Loan renewed by 14 days!', 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Pay Fine
  const handlePayFine = async (loanId) => {
    try {
      const res = await fetch(`/api/loans/${loanId}/pay-fine`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to record fine payment', 'error');
      } else {
        showToast('Fine payment settled successfully!', 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Book
  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to delete book', 'error');
      } else {
        showToast(`Book "${book.title}" deleted from catalog.`, 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Member
  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove member "${member.full_name}"?`)) return;
    try {
      const res = await fetch(`/api/members/${member.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to remove member', 'error');
      } else {
        showToast(`Member "${member.full_name}" removed.`, 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Quick Issue with specific preselected book
  const handleOpenIssueForBook = (book) => {
    setPreselectedBook(book);
    setIssueModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onOpenIssue={() => {
          setPreselectedBook(null);
          setIssueModalOpen(true);
        }}
        onOpenAddBook={() => {
          setBookToEdit(null);
          setBookModalOpen(true);
        }}
        onOpenAddMember={() => {
          setMemberToEdit(null);
          setMemberModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        
        {/* KPI Operational Metrics Ribbon */}
        <StatsBar stats={stats} onSelectTab={setActiveTab} />

        {/* Dynamic Views */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
            Loading Library Catalog...
          </div>
        ) : (
          <>
            {/* View 1: Books Catalog */}
            {activeTab === 'books' && (
              <BooksView
                books={books}
                categories={categories}
                authors={authors}
                onSelectBook={(book) => setDetailBookId(book.id)}
                onEditBook={(book) => {
                  setBookToEdit(book);
                  setBookModalOpen(true);
                }}
                onDeleteBook={handleDeleteBook}
                onIssueBook={handleOpenIssueForBook}
                onAddBook={() => {
                  setBookToEdit(null);
                  setBookModalOpen(true);
                }}
              />
            )}

            {/* View 2: Members Management */}
            {activeTab === 'members' && (
              <MembersView
                members={members}
                onSelectMember={(member) => setDetailMemberId(member.id)}
                onEditMember={(member) => {
                  setMemberToEdit(member);
                  setMemberModalOpen(true);
                }}
                onDeleteMember={handleDeleteMember}
                onAddMember={() => {
                  setMemberToEdit(null);
                  setMemberModalOpen(true);
                }}
              />
            )}

            {/* View 3: Circulation & Loans Desk */}
            {activeTab === 'loans' && (
              <LoansView
                loans={loans}
                onIssueClick={() => {
                  setPreselectedBook(null);
                  setIssueModalOpen(true);
                }}
                onReturnBook={handleReturnBook}
                onRenewLoan={handleRenewLoan}
                onPayFine={handlePayFine}
              />
            )}

            {/* View 4: Overdue Tracker */}
            {activeTab === 'overdue' && (
              <OverdueTracker
                overdueLoans={overdueLoans}
                onReturnBook={handleReturnBook}
                onPayFine={handlePayFine}
                onSendReminder={(loan) => {
                  showToast(`Reminder sent to ${loan.member_name} (${loan.member_email})`, 'info');
                }}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/70 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Athenaeum Library System</span>
            <span>•</span>
            <span>Books, Patrons & Circulation Desk</span>
          </div>
          <div>
            Built with React, Node.js & Express
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <IssueModal
        isOpen={issueModalOpen}
        onClose={() => {
          setIssueModalOpen(false);
          setPreselectedBook(null);
        }}
        books={books}
        members={members}
        preselectedBook={preselectedBook}
        onIssueSuccess={(msg) => {
          showToast(msg, 'success');
          fetchAllData();
        }}
      />

      <BookModal
        isOpen={bookModalOpen}
        onClose={() => {
          setBookModalOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
        authors={authors}
        categories={categories}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          fetchAllData();
        }}
        onAuthorCreated={(author) => setAuthors(prev => [...prev, author])}
        onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
      />

      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => {
          setMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          fetchAllData();
        }}
      />

      <BookDetailModal
        bookId={detailBookId}
        onClose={() => setDetailBookId(null)}
        onIssueBook={handleOpenIssueForBook}
      />

      <MemberDetailModal
        memberId={detailMemberId}
        onClose={() => setDetailMemberId(null)}
        onReturnBook={handleReturnBook}
      />

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
