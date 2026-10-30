import React from 'react';
import { BookOpen, Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function StatsBar({ stats, onSelectTab }) {
  if (!stats) return null;

  const availabilityPercent = stats.totalCopies > 0 
    ? Math.round((stats.availableCopies / stats.totalCopies) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-w-7xl mx-auto px-4 lg:px-8 py-5">
      
      {/* 1. Total Catalog */}
      <div 
        onClick={() => onSelectTab('books')}
        className="group cursor-pointer p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Book Catalog</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white">{stats.totalTitles}</span>
          <span className="text-xs text-slate-400 font-medium">titles</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {stats.totalCopies} total physical copies
        </p>
      </div>

      {/* 2. Available Copies */}
      <div 
        onClick={() => onSelectTab('books')}
        className="group cursor-pointer p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Available on Shelf</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-emerald-400">{stats.availableCopies}</span>
          <span className="text-xs text-slate-400 font-medium">in stock</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${availabilityPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Active Loans */}
      <div 
        onClick={() => onSelectTab('loans')}
        className="group cursor-pointer p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Active Loans</span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-sky-400">{stats.activeLoans}</span>
          <span className="text-xs text-slate-400 font-medium">borrowed</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {stats.borrowedCopies} total copies out
        </p>
      </div>

      {/* 4. Overdue Books */}
      <div 
        onClick={() => onSelectTab('overdue')}
        className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 shadow-sm ${
          stats.overdueLoans > 0 
            ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400 hover:bg-rose-950/30' 
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Overdue Books</span>
          <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
            stats.overdueLoans > 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-extrabold ${stats.overdueLoans > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {stats.overdueLoans}
          </span>
          <span className="text-xs text-rose-300/80 font-medium">need return</span>
        </div>
        <p className="text-[11px] text-rose-400/90 font-medium mt-1">
          ${stats.fines?.pending_fines?.toFixed(2) || '0.00'} uncollected fines
        </p>
      </div>

      {/* 5. Registered Members */}
      <div 
        onClick={() => onSelectTab('members')}
        className="group cursor-pointer p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900 transition-all duration-300 shadow-sm col-span-2 md:col-span-4 lg:col-span-1"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Members</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-purple-300">{stats.totalMembers}</span>
          <span className="text-xs text-slate-400 font-medium">patrons</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {stats.activeMembers} active cardholders
        </p>
      </div>

    </div>
  );
}
