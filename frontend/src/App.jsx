import React, { useState } from 'react';
import { Send, Database, Sparkles, AlertCircle, CheckCircle, Code, BarChart3, Grid3X3, List, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'https://kabbadi-video-search.onrender.com';

function App() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Show 9 video cards per page

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim() }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.detail || 'Failed to get response');
        });
      }
      return response.json();
    })
    .then(data => {
      let columns = [];
      let tableData = [];
      let urlResults = [];

      const raw = data.data?.raw_results || [];

      if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object' && raw[0].url) {
        urlResults = raw.map((item, idx) => ({
          url: item.url,
          title: `Video ${idx + 1}`
        }));
      }

      setResult({
        answer: data.data?.answer || '',
        query: data.data?.query || '',
        tokensUsed: data.data?.tokens_used || 0,
        urlResults,
        error: null,
        success: true,
      });
      setCurrentPage(1);
    })
    .catch(err => {
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const exampleQuestions = [
    "give me url of successful raids of pradeep narwal",
  ];

  const handleExampleClick = (example) => {
    setQuestion(example);
  };

  // Pagination logic
  const totalPages = result?.urlResults ? Math.ceil(result.urlResults.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = result?.urlResults?.slice(startIndex, endIndex) || [];

  // Helper to extract YouTube thumbnail or fallback to generic video icon
  const getVideoThumbnail = (url) => {
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/);
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    // Vimeo
    // (Vimeo thumbnail requires API, so fallback to generic)
    // MP4 or other direct video: use a placeholder
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kabbadi Video Search</h1>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 text-center">
              Search videos the smart way.
            </p>
          </div>
          {/* Search Bar */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="Search for videos"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  disabled={loading}
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !question.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Example Questions */}
        {!result && !loading && (
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Try these example questions:</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {exampleQuestions.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Results Display */}
        {result && result.success && !result.error && result.urlResults && result.urlResults.length > 0 && (
          <div className="space-y-6">
            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {currentItems.map((item, idx) => {
                const thumb = getVideoThumbnail(item.url);
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.title || 'Video thumbnail'}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                        <span>🎬</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 truncate">{item.title || 'Untitled Video'}</h4>
                    </div>
                  </a>
                );
              })}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;