// src/pages/AboutUs.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Car, Award, Heart, Target, ArrowRight } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8"
          >
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">edrivers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12"
          >
            We are revolutionizing transportation in Nigeria by connecting professional, verified drivers with people and businesses who need safe, reliable, and convenient mobility solutions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-6"
          >
            <a href="/login" className="px-10 py-5 bg-blue-600 text-white font-bold text-xl rounded-full shadow-lg hover:shadow-2xl transition flex items-center gap-3">
              Hire a Driver <ArrowRight className="h-6 w-6" />
            </a>
            <a href="/login" className="px-10 py-5 border-4 border-blue-600 text-blue-600 font-bold text-xl rounded-full hover:bg-blue-600 hover:text-white transition">
              Become a Driver
            </a>
          </motion.div>
        </div>
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
            alt="Nigeria roads"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl"
          >
            <Target className="h-16 w-16 mb-6" />
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed">
              To make safe and reliable transportation accessible to everyone in Nigeria by building a trusted network of professional drivers and empowering them with fair earning opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl"
          >
            <Award className="h-16 w-16 mb-6" />
            <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
            <p className="text-xl leading-relaxed">
              To become Nigeria's most trusted driver service platform, setting the standard for safety, professionalism, and excellence in transportation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <ShieldCheck className="h-16 w-16 text-blue-600" />, title: "Safety First", desc: "Every driver is thoroughly vetted and background-checked." },
              { icon: <Users className="h-16 w-16 text-purple-600" />, title: "Trust & Reliability", desc: "We connect you only with professional, punctual drivers." },
              { icon: <Heart className="h-16 w-16 text-pink-600" />, title: "Community", desc: "Supporting drivers with fair pay and growth opportunities." },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-3xl shadow-xl text-center hover:shadow-2xl transition"
              >
                <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-8">
                  {value.icon}
                </div>
                <h3 className="text-3xl font-bold mb-4">{value.title}</h3>
                <p className="text-xl text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Story */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8">Our Story</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Founded in 2023, edrivers was born from a simple observation: finding a trustworthy driver in Nigeria is hard.
            </p>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              We experienced the frustration of unreliable transport, safety concerns, and lack of professional options. So we decided to fix it.
            </p>
            <p className="text-xl text-gray-600 leading-relaxed">
              Today, we proudly serve thousands of customers and drivers across major cities, building a safer, more reliable transportation ecosystem.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
              alt="Team collaboration"
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-2xl">
              <p className="text-4xl font-bold">5,000+</p>
              <p className="text-xl">Happy Customers</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <h2 className="text-5xl font-bold mb-8">Join the edrivers Movement</h2>
        <p className="text-2xl mb-12 max-w-4xl mx-auto">
          Whether you're looking for a driver or want to become one — we're here to make transportation better for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center">
          <a href="/login" className="px-12 py-6 bg-white text-blue-600 font-bold text-2xl rounded-full shadow-2xl hover:shadow-purple-500/50 transition">
            Hire a Driver
          </a>
          <a href="/login" className="px-12 py-6 border-4 border-white text-white font-bold text-2xl rounded-full hover:bg-white hover:text-blue-600 transition">
            Become a Driver
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;