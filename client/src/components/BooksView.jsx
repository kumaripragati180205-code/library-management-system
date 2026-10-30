import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Info, 
  Edit3, 
  Trash2, 
  ArrowLeftRight, 
  MapPin, 
  Barcode, 
  Calendar 
} from 'lucide-react';

export default function BooksView({ 
  books, 
  categories, 
  onSelectBook, 
  onEditBook, 
  onDeleteBook, 
  onIssueBook, 
  onAddBook 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchSearch = 
        !searchQuery.trim() || 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.isbn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || b.category_id === Number(selectedCategory);
      const matchAvailability = !availableOnly || b.available_copies > 0;

      return matchSearch && matchCategory && matchAvailability;
    });
  }, [books, searchQuery, selectedCategory, availableOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author name, or ISBN..."
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

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Genres
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-slate-100 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: cat.color || '#3b82f6' }}
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Toggle Available & Add button */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span>In Stock Only</span>
          </label>

          <button
            onClick={onAddBook}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all whitespace-nowrap active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Book</span>
          </button>
        </div>

      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No books found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or adding a new book to the catalog.
          </p>
          <button
            onClick={onAddBook}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map(book => {
            const isAvailable = book.available_copies > 0;
            const stockPercent = Math.round((book.available_copies / book.total_copies) * 100);

            return (
              <div 
                key={book.id}
                className="group flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300"
              >
                {/* Book Cover & Badges */}
                <div className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onSelectBook(book)}>
                  <img
                    src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span 
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-md backdrop-blur-md"
                      style={{ backgroundColor: `${book.category_color || '#3b82f6'}dd` }}
                    >
                      {book.category_name}
                    </span>
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md shadow-md ${
                      isAvailable 
                        ? 'bg-emerald-500/80 text-white' 
                        : 'bg-rose-500/80 text-white'
                    }`}>
                      {isAvailable ? `${book.available_copies} Available` : 'Checked Out'}
                    </span>
                  </div>

                  {/* Shelf Location Tag */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-md border border-slate-700/50">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>Shelf {book.shelf_location || 'A-1'}</span>
                  </div>
                </div>

                {/* Book Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => onSelectBook(book)}
                      className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    
                    {/* Author relation */}
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <span>by</span>
                      <span className="font-semibold text-slate-200 hover:underline cursor-pointer" onClick={() => onSelectBook(book)}>
                        {book.author_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1" title="ISBN">
                        <Barcode className="w-3.5 h-3.5 text-slate-500" />
                        {book.isbn}
                      </span>
                      {book.published_year && (
                        <span className="flex items-center gap-1" title="Publication Year">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {book.published_year}
                        </span>
                      )}
                    </div>

                    {book.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* Stock Bar & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span>Stock Status</span>
                      <span className="font-semibold text-slate-300">
                        {book.available_copies} / {book.total_copies} copies
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          stockPercent > 50 ? 'bg-emerald-500' : stockPercent > 20 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onIssueBook(book)}
                        disabled={!isAvailable}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isAvailable
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>Issue</span>
                      </button>

                      <button
                        onClick={() => onSelectBook(book)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title="View Book Details & Loan History"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditBook(book)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title="Edit Book Information"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteBook(book)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
