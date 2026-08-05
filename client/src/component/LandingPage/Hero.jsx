
import React from 'react';
import { Link } from 'react-router-dom';
import im from "../../assets/DriversPicture.jpg";  // Your hero background image
import Navbar from '../Navbar';
import DriverCategoriesGrid from './DriverCategories';
import im1 from '../../assets/editedPicture.jpg'
const Hero = () => {
  return (
    <>

        <div className=" bg-gray-100">  {/* Global gray-100 bg */}
      {/* Hero Section - Full hero with image overlay */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${im})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          // backgroundAttachment: 'cover',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0  bg-opacity-90"></div>
        {/* Subtle pattern overlay (optional, low opacity) */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-7xl text-['#3B82F6'] font-bold mb-6 animate-fade-in-up delay-100">
            Hire Reliable Drivers <span className="text-blue-500 block">On Demand</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 font-bold  mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Seamless ridesharing for every journey. Connect with verified drivers, track in real-time, and pay securely—all from your browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link
              to="/signup"
              className="bg-blue-500 hover:bg-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-primary-500/25"
            >
              Get Started Free
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-500 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-500 transform hover:scale-110"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>


    </div>
    </>

  );
};


export default Hero;