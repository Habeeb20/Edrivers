// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { persistor } from '../store';
import { logout } from '../store/slices/userSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Auth state
  const { user, token } = useSelector((state) => state.user);
  const isAuthenticated = !!token || !!user;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Driver Services' },
    { to: '/training', label: 'Join Training' },
    { to: 'https://edrive.ng/login', label: 'Book a Ride' },
    { to: 'https://efixit.ng/login', label: ' service provider' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-500">
            E-Drivers
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-gray-700 font-medium rounded-md transition-colors duration-300 ${
                  location.pathname === link.to
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'hover:text-blue-500'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Conditional Auth Buttons */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 font-medium hover:text-blue-500 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold px-6 py-2 rounded-lg transition-all duration-300"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-500 focus:outline-none transition"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 text-gray-700 font-medium rounded-md transition ${
                    location.pathname === link.to
                      ? 'text-blue-500 bg-blue-50'
                      : 'hover:text-blue-500 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-gray-700 font-medium hover:text-blue-500"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg mt-4 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full text-center border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold px-6 py-3 rounded-lg mt-3 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

