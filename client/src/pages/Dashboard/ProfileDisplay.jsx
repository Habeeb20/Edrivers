import React, { useState } from 'react';
import { 
  User, Car, ShieldCheck, FileText, MapPin, 
  Phone, Mail, Briefcase, Globe, Settings 
} from 'lucide-react';
import { motion } from 'framer-motion';

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
    {Icon && <Icon className="w-5 h-5 text-blue-500 mt-1" />}
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || 'Not Provided'}</p>
    </div>
  </div>
);

const ProfileDisplay = ({ fullData }) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  // Destructure the data coming from your new controller
  const { guarantors = [], documents = [], driverProfile = null, ...user } = fullData || {};

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    ...(user.role === 'driver' ? [{ id: 'professional', label: 'Driver Profile', icon: Car }] : []),
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'guarantors', label: 'Guarantors', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-[2rem] shadow-2xl border border-gray-100">
      {/* --- HEADER SECTION --- */}
      <div className="relative mb-8 p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <img 
            src={user.avatar || 'https://via.placeholder.com/150'} 
            className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
            alt="Avatar"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-md uppercase">
                {user.role}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md uppercase ${
                user.verificationStatus === 'verified' ? 'bg-green-400/20 text-green-100' : 'bg-yellow-400/20 text-yellow-100'
              }`}>
                {user.verificationStatus}
              </span>
            </div>
          </div>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex space-x-2 mb-8 p-1 bg-gray-100 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* PERSONAL TAB */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Email Address" value={user.email} icon={Mail} />
            <InfoItem label="Phone" value={user.phone} icon={Phone} />
            <InfoItem label="Date of Birth" value={new Date(user.dateOfBirth).toLocaleDateString()} icon={Settings} />
            <InfoItem label="Location" value={`${user.lga}, ${user.state}`} icon={MapPin} />
            <InfoItem label="Street" value={user.address} icon={MapPin} />
            <InfoItem label="Preferred Payment" value={user.preferredPayment} icon={Briefcase} />
          </div>
        )}

        {/* DRIVER PROFESSIONAL TAB */}
        {activeTab === 'professional' && driverProfile && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase mb-2">Bio</p>
                <p className="text-gray-700 italic">"{driverProfile.bio || 'No bio provided'}"</p>
              </div>
              <InfoItem label="Experience" value={`${driverProfile.yearsOfExperience} Years`} icon={Briefcase} />
              <InfoItem label="Transmission" value={driverProfile.transmission?.join(', ')} icon={Settings} />
              <InfoItem label="Availability" value={driverProfile.isAvailable ? 'Available Now' : 'Busy'} icon={ShieldCheck} />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Languages Spoken
              </p>
              <div className="flex flex-wrap gap-2">
                {driverProfile.languagesSpoken?.map(lang => (
                  <span key={lang} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm shadow-sm">{lang}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 capitalize">{doc.type.replace('-', ' ')}</p>
                    <p className="text-xs text-gray-500 uppercase">{doc.status}</p>
                  </div>
                </div>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-bold hover:underline">View File</a>
              </div>
            ))}
          </div>
        )}

        {/* GUARANTORS TAB */}
        {activeTab === 'guarantors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guarantors.map((g) => (
              <div key={g.position} className="p-6 bg-white border border-gray-200 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-gray-100 text-[10px] font-bold text-gray-400 uppercase rounded-bl-xl">
                  Guarantor {g.position}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{g.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} /> {g.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} /> {g.relationship}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} /> {g.address?.street}, {g.address?.state}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileDisplay;