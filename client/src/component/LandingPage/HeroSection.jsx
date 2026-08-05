// src/components/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const messages = [
  {
    text: "Skip the stress of driver recruitment—access thousands of pre-qualified, professional drivers ready to hit the road.",
    gradient: "from-blue-600 via-purple-600 to-pink-600",
  },
  {
    text: "Hire reliable drivers instantly—verified, experienced, and background-checked for your peace of mind.",
    gradient: "from-indigo-600 via-teal-500 to-emerald-600",
  },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative  flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${messages[currentIndex].gradient}`}
        />
      </AnimatePresence>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8"
        >
          Find Your Perfect Driver<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
            Instantly
          </span>
        </motion.h1>

        {/* Animated Interchangeable Text */}
        <div className="h-32 md:h-40 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="text-xl md:text-3xl lg:text-4xl font-medium max-w-5xl leading-relaxed px-4"
            >
              {messages[currentIndex].text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
            <Link  to="/signup">
               <button className="px-10 py-5 bg-white text-gray-900 font-bold text-xl rounded-full shadow-2xl hover:shadow-pink-500/50 transition transform hover:scale-105">
            Hire a Driver Now
          </button>
            </Link>
          <Link  to="/signup">
          <button className="px-10 py-5 bg-transparent border-4 border-white text-white font-bold text-xl rounded-full hover:bg-white hover:text-gray-900 transition transform hover:scale-105">
            Become a Driver
          </button>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-20 flex flex-wrap justify-center gap-12 text-center"
        >
          <div>
            <p className="text-4xl font-bold">10,000+</p>
            <p className="text-lg mt-2">Verified Drivers</p>
          </div>
          <div>
            <p className="text-4xl font-bold">98%</p>
            <p className="text-lg mt-2">Satisfaction Rate</p>
          </div>
          <div>
            <p className="text-4xl font-bold">24/7</p>
            <p className="text-lg mt-2">Support Available</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
    </section>
  );
};

export default HeroSection;