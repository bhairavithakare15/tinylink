'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface LinkData {
  id: string;
  code: string;
  targetUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function StatsPage() {
  const params = useParams();
  const code = params.code as string;
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLink();
  }, [code]);

  const fetchLink = async () => {
    try {
      const res = await fetch(`/api/links/${code}`);
      if (!res.ok) {
        setError(res.status === 404 ? 'Link not found' : 'Failed to fetch link data');
        return;
      }
      const data = await res.json();
      setLink(data);
    } catch (err) {
      setError('Failed to fetch link data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    const shortUrl = `${window.location.origin}/${code}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = typeof window !== 'undefined' ? `${window.location.origin}/${code}` : `/${code}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span>🔗</span> TinyLink
          </Link>
          <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm sm:text-base transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 sm:py-8 w-full">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📊</span> Link Statistics
          </h1>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Link Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Short URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-blue-600 text-sm break-all font-mono">
                    {shortUrl}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className={`px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Target URL</label>
                <a
                  href={link?.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-100 px-4 py-3 rounded-lg text-blue-600 hover:text-blue-800 text-sm break-all transition-colors"
                >
                  {link?.targetUrl}
                </a>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Short Code</label>
                <p className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-gray-800">{link?.code}</p>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center text-white shadow-md">
                <p className="text-5xl sm:text-6xl font-bold">{link?.clicks}</p>
                <p className="text-blue-100 mt-2 text-lg">Total Clicks</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Last Clicked</label>
                  <p className="bg-gray-100 px-4 py-3 rounded-lg text-gray-800 text-sm">
                    {formatDate(link?.lastClicked || null)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Created</label>
                  <p className="bg-gray-100 px-4 py-3 rounded-lg text-gray-800 text-sm">
                    {formatDate(link?.createdAt || null)}
                  </p>
                </div>
              </div>

              {/* Test Link Button */}
              <a
                href={`/${link?.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                🚀 Test Redirect
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          TinyLink © {new Date().getFullYear()} — Fast & Simple URL Shortener
        </div>
      </footer>
    </div>
  );
}