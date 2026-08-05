// components/GoToTopButton.jsx
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const SHOW_AFTER_PX = 300; // how far down the page before the button appears

const GoToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // set initial state in case page loads mid-scroll
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Go to top"
      className={`fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
};

export default GoToTopButton;