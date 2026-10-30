import React from 'react';
import { 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  AlertTriangle, 
  BookPlus, 
  UserPlus 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, onOpenIssue, onOpenAddBook, onOpenAddMember }) {
  const tabs = [
    { id: 'books', label: 'Books Catalog', icon: BookOpen, count: stats?.totalTitles },
    { id: 'members', label: 'Members', icon: Users, count: stats?.totalMembers },
    { id: 'loans', label: 'Circulation & Loans', icon: ArrowLeftRight, count: stats?.activeLoans },
    { 
      id: 'overdue', 
      label: 'Overdue Tracker', 
      icon: AlertTriangle, 
      count: stats?.overdueLoans, 
      alert: stats?.overdueLoans > 0 
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 text-xl">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-400">
                Athenaeum
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Library System
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Modern Library Management & Circulation System</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-x-auto max-w-full">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive 
                      ? 'bg-slate-950 text-amber-400' 
                      : tab.alert 
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            title="Issue a book to a member"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Issue Book</span>
          </button>
          
          <button
            onClick={onOpenAddBook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Add new book to catalog"
          >
            <BookPlus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Add Book</span>
          </button>

          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            title="Register new library member"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Member</span>
          </button>
        </div>

      </div>
    </header>
  );
}
