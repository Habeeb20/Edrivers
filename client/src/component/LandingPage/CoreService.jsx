// src/components/CoreServices.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Car, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';

const CoreServices = () => {
  const services = [
    {
      title: "Become a Certified Driver",
      description: "Join our elite network of professional drivers. Get verified, access high-paying jobs, and build your career with edrivers.",
      icon: <ShieldCheck className="h-12 w-12" />,
      gradient: "from-blue-500 to-cyan-500",
      hoverGradient: "from-blue-600 to-cyan-600",
      link: "/login",
      cta: "Start Earning Today",
    },
    {
      title: "Hire a Driver",
      description: "Find reliable, background-checked drivers instantly. Whether for daily commute, events, or long trips — we’ve got you covered.",
      icon: <Car className="h-12 w-12" />,
      gradient: "from-purple-500 to-pink-500",
      hoverGradient: "from-purple-600 to-pink-600",
      link: "/login",
      cta: "Hire Now",
    },
    {
      title: "Finance Options",
      description: "Flexible payment plans and financing solutions to hire drivers or access premium services without upfront stress.",
      icon: <CreditCard className="h-12 w-12" />,
      gradient: "from-emerald-500 to-teal-500",
      hoverGradient: "from-emerald-600 to-teal-600",
      link: "/login",
      cta: "Explore Financing",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            Our Core Services
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
            Everything you need to connect, earn, and drive with confidence — all in one place.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -12, scale: 1.05 }}
              className="group relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
              {/* Gradient Top Bar */}
              <div className={`h-2 bg-gradient-to-r ${service.gradient}`} />

              <div className="p-10 text-center">
                {/* Icon with Gradient Background */}
                <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${service.gradient} text-white shadow-2xl mb-8 transform group-hover:scale-110 transition`}>
                  {service.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-10">
                  {service.description}
                </p>

                {/* CTA Button */}
                <a
                  href={service.link}
                  className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-white font-bold text-xl shadow-lg transition-all transform group-hover:scale-105 bg-gradient-to-r ${service.hoverGradient}`}
                >
                  {service.cta}
                  <ArrowRight className="h-6 w-6" />
                </a>
              </div>

              {/* Subtle Bottom Glow on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-0 group-hover:opacity-10 transition duration-500 pointer-events-none`} />
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-lg text-gray-600">
            Trusted by <span className="font-bold text-2xl text-primary-600">10,000+</span> drivers and clients across Nigeria
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CoreServices;