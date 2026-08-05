// src/components/Footer.jsx
import React from 'react';
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'About Us',      path: '/about'    },
  { label: 'Driver Training', path: '/training' },
  { label: 'how it works',     path: '/services'  },
  { label: 'Driver Shop',    path: '/login'     },   // ← confirm this one
];
const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
              <Car className="h-10 w-10 text-blue-400" />
              edrivers
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              Nigeria's leading platform connecting professional drivers with individuals and businesses. Safe, reliable, and affordable transportation solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-blue-600 transition">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-sky-500 transition">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-pink-600 transition">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-blue-700 transition">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
         <div>
      <h3 className="text-2xl font-bold mb-6">Quick Links</h3>
      <ul className="space-y-4">
        {quickLinks.map((item) => (
          <li key={item.label}>
            <Link
              to={item.path}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowRight className="h-4 w-4" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>

          {/* Services */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Our Services</h3>
            <ul className="space-y-4">
              {['Hire a Driver', 'Full-Time Drivers', 'Airport Transfers', 'Corporate Chauffeur', 'School Runs'].map((service) => (
                <li key={service}>
                  <a href="/login" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                    <ArrowRight className="h-4 w-4" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
            <div className="space-y-6">
              <p className="flex items-center gap-4 text-lg">
                <Phone className="h-6 w-6 text-blue-400" />
                +234 7000555666
              </p>
              <p className="flex items-center gap-4 text-lg">
                <Mail className="h-6 w-6 text-blue-400" />
                email: info@edrivers.ng

              </p>
              <p className="flex items-center gap-4 text-lg">
                <MapPin className="h-6 w-6 text-blue-400" />
                Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} edrivers. All rights reserved. | 
            <a href="#" className="hover:text-white mx-2">Privacy Policy</a> | 
            <a href="#" className="hover:text-white mx-2">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;