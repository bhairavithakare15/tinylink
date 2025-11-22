'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface LinkData {
  id: string;
  code: string;
  targetUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

// Toast Component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`}>
      <div className="flex items-center gap-2">
        <span>{type === 'success' ? '✓' : '✕'}</span>
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">×</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'clicks'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code: customCode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create link');
        showToast(data.error || 'Failed to create link', 'error');
        return;
      }

      showToast(`Short link created: ${window.location.origin}/${data.code}`, 'success');
      setUrl('');
      setCustomCode('');
      setShowForm(false);
      fetchLinks();
    } catch (err) {
      setFormError('Failed to create link. Please try again.');
      showToast('Failed to create link', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    setDeleting(code);
    try {
      const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Link deleted successfully', 'success');
        fetchLinks();
      } else {
        showToast('Failed to delete link', 'error');
      }
    } catch (err) {
      showToast('Failed to delete link', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = async (code: string) => {
    const shortUrl = `${window.location.origin}/${code}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const truncateUrl = (u: string, max = 30) => 
    u.length <= max ? u : u.substring(0, max) + '...';

  const filteredLinks = links
    .filter(l => 
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.targetUrl.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = sortBy === 'clicks' ? a.clicks : new Date(a.createdAt).getTime();
      const bVal = sortBy === 'clicks' ? b.clicks : new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const isValidUrl = (u: string) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isValidCode = (c: string) => !c || /^[A-Za-z0-9]{6,8}$/.test(c);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span>🔗</span> TinyLink
          </h1>
          <Link href="/healthz" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            Health Check
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 sm:py-8 w-full">
        {/* Create Button */}
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Create Short Link
            </button>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Create New Link</h2>
                <button 
                  onClick={() => { setShowForm(false); setFormError(''); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      url && !isValidUrl(url) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {url && !isValidUrl(url) && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid URL (http:// or https://)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Code <span className="text-gray-400 font-normal">(optional, 6-8 alphanumeric)</span>
                  </label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="mycode1"
                    maxLength={8}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      customCode && !isValidCode(customCode) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {customCode && !isValidCode(customCode) && (
                    <p className="text-red-500 text-sm mt-1">Code must be 6-8 alphanumeric characters</p>
                  )}
                </div>

                {formError && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !isValidUrl(url) || !isValidCode(customCode)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-all duration-200"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Creating...
                    </span>
                  ) : (
                    'Create Short Link'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Links Section */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Your Links</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="🔍 Search links..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-');
                    setSortBy(by as 'createdAt' | 'clicks');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="clicks-desc">Most Clicks</option>
                  <option value="clicks-asc">Least Clicks</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-3">Loading links...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {search ? 'No links match your search' : 'No links created yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {search ? 'Try a different search term' : "Click 'Create Short Link' to get started!"}
              </p>
              {!search && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Create your first link
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Short Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Target URL</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Clicks</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Last Clicked</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <Link href={`/code/${link.code}`} className="text-blue-600 hover:text-blue-800 font-mono font-medium">
                            {link.code}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={link.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 text-sm"
                            title={link.targetUrl}
                          >
                            {truncateUrl(link.targetUrl, 40)}
                          </a>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                            {link.clicks}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(link.lastClicked)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => copyToClipboard(link.code)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Copy short URL"
                            >
                              {copiedCode === link.code ? '✓' : '📋'}
                            </button>
                            <Link
                              href={`/code/${link.code}`}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View stats"
                            >
                              📊
                            </Link>
                            <button
                              onClick={() => handleDelete(link.code)}
                              disabled={deleting === link.code}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete link"
                            >
                              {deleting === link.code ? '...' : '🗑️'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredLinks.map((link) => (
                  <div key={link.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/code/${link.code}`} className="text-blue-600 font-mono font-medium text-lg">
                        {link.code}
                      </Link>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {link.clicks} clicks
                      </span>
                    </div>
                    <a
                      href={link.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-sm block mb-2 truncate"
                    >
                      {link.targetUrl}
                    </a>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        Last clicked: {formatDate(link.lastClicked)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(link.code)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded"
                        >
                          {copiedCode === link.code ? '✓' : '📋'}
                        </button>
                        <Link href={`/code/${link.code}`} className="p-2 text-gray-500 hover:text-blue-600 rounded">
                          📊
                        </Link>
                        <button
                          onClick={() => handleDelete(link.code)}
                          disabled={deleting === link.code}
                          className="p-2 text-gray-500 hover:text-red-600 rounded disabled:opacity-50"
                        >
                          {deleting === link.code ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          TinyLink © {new Date().getFullYear()} — Fast & Simple URL Shortener
        </div>
      </footer>
    </div>
  );
}