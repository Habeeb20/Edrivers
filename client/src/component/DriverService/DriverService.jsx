// src/pages/DriverService.jsx
import React from 'react';
import { motion } from 'framer-motion';
import im from "../../assets/driverIncar.jpg"
import { Car, ShieldCheck, Clock, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { DollarSign } from 'lucide-react';
const DriverService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900 font-sans leading-normal">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center text-white z-10 max-w-4xl px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Reliable Driver Services at Your Fingertips
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Find professional, verified drivers for every need—daily commutes, special events, or long trips. Safe, convenient, and affordable.
          </p>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white text-xl font-semibold rounded-full shadow-lg hover:shadow-2xl transition"
          >
            Get Started <ArrowRight className="h-6 w-6" />
          </motion.a>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50" />
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={im}
          alt="Professional driver"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose Our Driver Services?</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: <ShieldCheck className="h-16 w-16 text-blue-600 mb-6" />,
              title: 'Verified Drivers',
              description: 'All drivers are background-checked, licensed, and rated by users for your safety.',
            },
            {
              icon: <Clock className="h-16 w-16 text-purple-600 mb-6" />,
              title: 'Flexible Scheduling',
              description: 'Book for hours, days, or months. Instant availability and real-time tracking.',
            },
            {
              icon: <Users className="h-16 w-16 text-green-600 mb-6" />,
              title: '24/7 Support',
              description: 'Our team is always available to assist with bookings, changes, or emergencies.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-xl text-center hover:shadow-2xl transition"
            >
              {feature.icon}
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-lg text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-50 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: '1',
              title: 'Login or Sign Up',
              description: 'Create your account in seconds to access our services.',
            },
            {
              step: '2',
              title: 'Search Drivers',
              description: 'Browse verified drivers based on your needs and location.',
            },
            {
              step: '3',
              title: 'Book & Pay',
              description: 'Select your driver, schedule, and make secure payment.',
            },
            {
              step: '4',
              title: 'Enjoy the Ride',
              description: 'Your driver arrives on time. Rate after the service.',
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white text-2xl font-bold rounded-full mb-6 shadow-lg">
                {step.step}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-lg text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Johnson',
              role: 'Business Owner',
              quote: 'edrivers made finding a reliable driver effortless. Highly recommended!',
            },
            {
              name: 'Michael Chen',
              role: 'Frequent Traveler',
              quote: 'The airport transfer service is top-notch. Always on time and professional.',
            },
            {
              name: 'Emma Davis',
              role: 'Parent',
              quote: 'Family-friendly drivers are a lifesaver for school runs. Safe and friendly!',
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-xl"
            >
              <Star className="h-6 w-6 text-yellow-500 mb-2" />
              <p className="text-lg text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Finance Options Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Flexible Finance Options</h2>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-12">
          We offer easy payment plans to make hiring drivers more affordable. Choose what works for you.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Pay As You Go',
              description: 'No commitments. Pay per trip or hour.',
            },
            {
              title: 'Monthly Subscription',
              description: 'Unlimited hires for a fixed monthly fee.',
            },
            {
              title: 'Financing Partners',
              description: 'Partnered with banks for low-interest loans on premium services.',
            },
          ].map((option, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-xl text-center"
            >
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">{option.title}</h3>
              <p className="text-lg text-gray-600 mb-8">{option.description}</p>
              <a href="/login" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xl hover:text-blue-800">
                Learn More <ArrowRight className="h-5 w-5" />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl mb-12">Login to access premium driver services today.</p>
        <a href="/login" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 font-bold text-xl rounded-full shadow-lg hover:shadow-2xl transition">
          Login Now <ArrowRight className="h-6 w-6" />
        </a>
      </section>
    </div>
  );
};

export default DriverService;