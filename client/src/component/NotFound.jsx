// src/components/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col">
      {/* Background subtle patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex-grow flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center space-y-10">
          {/* Main 404 */}
          <div className="space-y-4">
            <h1 className="text-8xl sm:text-9xl font-extrabold text-gray-900 tracking-tight">
              <span className="inline-block animate-pulse">4</span>
              <span className="inline-block text-indigo-600 animate-bounce mx-2">0</span>
              <span className="inline-block animate-pulse">4</span>
            </h1>

            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-800">
                Page Not Found
              </h2>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            </div>

            <p className="text-xl text-gray-600 max-w-lg mx-auto mt-6 leading-relaxed">
              The page you're looking for seems to have wandered off the map. 
              It might have been moved, deleted, or is just taking a coffee break.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12">
            <Link
              to="/"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-medium rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to={-1} // go back one page
              className="inline-flex items-center gap-2 px-7 py-4 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Link>
          </div>

          {/* Search suggestion */}
          <div className="mt-16 pt-10 border-t border-gray-200">
            <p className="text-gray-600 mb-5">
              Or maybe you're looking for something else?
            </p>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search the site..."
                  className="w-full px-5 py-4 pl-12 pr-16 rounded-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Fun easter egg / illustration area */}
          <div className="mt-20 opacity-80">
            <div className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 animate-gradient-x">
              Oops!
            </div>
            <p className="mt-3 text-gray-500 text-sm sm:text-base">
              Looks like even our pixels got lost...
            </p>
          </div>
        </div>
      </div>

      {/* Footer-ish note */}
      <div className="relative py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Your App Name • Lost but never forgotten
      </div>
    </div>
  );
}