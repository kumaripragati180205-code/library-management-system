import React, { useState, useEffect } from 'react';
import { X, BookPlus, AlertCircle } from 'lucide-react';

export default function BookModal({ isOpen, onClose, bookToEdit, authors, categories, onSuccess, onAuthorCreated, onCategoryCreated }) {
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [totalCopies, setTotalCopies] = useState('3');
  const [shelfLocation, setShelfLocation] = useState('A-101');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick author / category creation popups
  const [showNewAuthorInput, setShowNewAuthorInput] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (bookToEdit) {
      setTitle(bookToEdit.title || '');
      setIsbn(bookToEdit.isbn || '');
      setAuthorId(bookToEdit.author_id || '');
      setCategoryId(bookToEdit.category_id || '');
      setPublisher(bookToEdit.publisher || '');
      setPublishedYear(bookToEdit.published_year || '');
      setTotalCopies(String(bookToEdit.total_copies || '1'));
      setShelfLocation(bookToEdit.shelf_location || 'A-101');
      setCoverUrl(bookToEdit.cover_url || '');
      setDescription(bookToEdit.description || '');
    } else {
      setTitle('');
      setIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setAuthorId(authors[0]?.id || '');
      setCategoryId(categories[0]?.id || '');
      setPublisher('');
      setPublishedYear(new Date().getFullYear());
      setTotalCopies('3');
      setShelfLocation('B-201');
      setCoverUrl('https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop');
      setDescription('');
    }
  }, [isOpen, bookToEdit, authors, categories]);

  if (!isOpen) return null;

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) return;
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAuthorName.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        onAuthorCreated(data);
        setAuthorId(data.id);
        setNewAuthorName('');
        setShowNewAuthorInput(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), color: '#ec4899' })
      });
      const data = await res.json();
      if (res.ok) {
        onCategoryCreated(data);
        setCategoryId(data.id);
        setNewCatName('');
        setShowNewCatInput(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !isbn.trim() || !authorId || !categoryId) {
      setError('Title, ISBN, Author, and Genre Category are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = bookToEdit ? `/api/books/${bookToEdit.id}` : '/api/books';
      const method = bookToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          isbn,
          author_id: Number(authorId),
          category_id: Number(categoryId),
          publisher,
          published_year: publishedYear ? Number(publishedYear) : null,
          total_copies: Number(totalCopies),
          shelf_location: shelfLocation,
          cover_url: coverUrl,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save book');
      } else {
        onSuccess(bookToEdit ? 'Book updated successfully!' : 'New book added to library catalog!');
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {bookToEdit ? 'Edit Book Details' : 'Add Book to Catalog'}
              </h2>
              <p className="text-xs text-slate-400">Manage relational book entities & inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
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
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Clean Code or The Great Gatsby"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Author selection with inline create */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Author (1 : N Relationship) *</label>
              <button
                type="button"
                onClick={() => setShowNewAuthorInput(!showNewAuthorInput)}
                className="text-[11px] text-amber-400 hover:underline font-semibold"
              >
                {showNewAuthorInput ? 'Cancel' : '+ New Author'}
              </button>
            </div>

            {showNewAuthorInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Author full name"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-amber-500/50 text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateAuthor}
                  className="px-3 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Save
                </button>
              </div>
            ) : (
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">-- Choose Author --</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.nationality || 'Author'})</option>
                ))}
              </select>
            )}
          </div>

          {/* Category selection with inline create */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Genre / Category *</label>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-[11px] text-amber-400 hover:underline font-semibold"
              >
                {showNewCatInput ? 'Cancel' : '+ New Category'}
              </button>
            </div>

            {showNewCatInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Genre name (e.g. Thriller)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-amber-500/50 text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Save
                </button>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">-- Choose Genre --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* ISBN & Shelf Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ISBN Code *</label>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Shelf Locator</label>
              <input
                type="text"
                placeholder="e.g. C-302"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Copies & Published Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                max="100"
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Year Published</label>
              <input
                type="number"
                placeholder="e.g. 2023"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Publisher & Cover URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Publisher</label>
            <input
              type="text"
              placeholder="e.g. Penguin Books, O'Reilly"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Book Description / Synopsis</label>
            <textarea
              rows={3}
              placeholder="Short overview of the book's contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95"
            >
              {isSubmitting ? 'Saving...' : bookToEdit ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
