// src/pages/JoinDriverTraining.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, ShieldCheck, Award, Users, Clock, MapPin, Phone, Mail, User, Calendar, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
const JoinDriverTraining = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    previousExperience: 'none',
    preferredSchedule: 'weekday',
    referralSource: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/training/register`, form);
      toast.success('Registration successful! We\'ll contact you soon.');
      setShowForm(false);
      // Reset form
      setForm({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        previousExperience: 'none',
        preferredSchedule: 'weekday',
        referralSource: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8">
            Join the League of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Certified Drivers</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12">
            Become a professional driver with our comprehensive training program. Get certified, gain skills, and start earning with edrivers.
          </p>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative inline-block"
          >
            {/* <img
              src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=80"
              alt="Professional driver training"
              className="rounded-3xl shadow-2xl max-w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Professional Training</h3>
              <p className="text-xl">Learn from experienced instructors</p>
            </div> */}
          </motion.div>
        </motion.div>

        {/* Training Benefits */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          {[
            {
              icon: <ShieldCheck className="h-12 w-12 text-blue-600" />,
              title: "Certified Program",
              desc: "Nationally recognized certification upon completion",
            },
            {
              icon: <Award className="h-12 w-12 text-purple-600" />,
              title: "Expert Instructors",
              desc: "Learn from drivers with 10+ years of experience",
            },
            {
              icon: <Users className="h-12 w-12 text-green-600" />,
              title: "Job Placement",
              desc: "Direct access to edrivers platform after graduation",
            },
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-xl text-center hover:shadow-2xl transition"
            >
              <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Program Details */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-white mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Training Program Details</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">What You'll Learn</h3>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <span>Defensive driving techniques</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <span>Road safety and traffic laws</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <span>Vehicle maintenance basics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <span>Customer service excellence</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <span>Navigation and route planning</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">Program Info</h3>
              <div className="space-y-6 text-lg">
                <p className="flex items-center gap-4">
                  <Clock className="h-8 w-8" />
                  <span><strong>Duration:</strong> 8 weeks (flexible scheduling)</span>
                </p>
                <p className="flex items-center gap-4">
                  <Calendar className="h-8 w-8" />
                  <span><strong>Classes:</strong> Weekdays or Weekends</span>
                </p>
                <p className="flex items-center gap-4">
                  <MapPin className="h-8 w-8" />
                  <span><strong>Location:</strong> Multiple centers across Nigeria</span>
                </p>
                <p className="flex items-center gap-4">
                  <Award className="h-8 w-8" />
                  <span><strong>Certification:</strong> Professional Driver License</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-16 py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition"
          >
            Enroll in Driver Training Now
          </motion.button>
        </div>
      </div>

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-10 relative"
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-4xl font-bold text-center mb-8">Driver Training Registration</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="+234..."
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Full Address
                  </label>
                  <textarea
                    required
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    rows="3"
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street, Lagos"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Lagos"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Lagos State"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">Previous Driving Experience</label>
                  <select
                    value={form.previousExperience}
                    onChange={e => setForm({ ...form, previousExperience: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="less-than-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-plus">3+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">Preferred Schedule</label>
                  <select
                    value={form.preferredSchedule}
                    onChange={e => setForm({ ...form, preferredSchedule: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekday">Weekday (Mon-Fri)</option>
                    <option value="weekend">Weekend (Sat-Sun)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold mb-2">How Did You Hear About Us?</label>
                  <input
                    type="text"
                    value={form.referralSource}
                    onChange={e => setForm({ ...form, referralSource: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Friend, Social Media, Website, etc."
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-5 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default JoinDriverTraining;