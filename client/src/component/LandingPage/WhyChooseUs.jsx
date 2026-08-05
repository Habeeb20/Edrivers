import React from 'react'

const WhyChooseUs = () => {
  return (
    <div>
              {/* Features Section - Clean cards with hover glow */}
      <section className="py-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose E-Drivers?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From safety to savings, we've got you covered with features built for real-world rides.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Verified Drivers", desc: "Background-checked pros with 4.9+ ratings. Your safety first.", color: "primary" },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Real-Time Tracking", desc: "Live GPS maps and ETAs. Know exactly where your ride is.", color: "secondary" },
              { icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2-2V2a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9h8zM3 21h18v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4z", title: "Secure Payments", desc: "Wallet integration, cards, or cash. Transparent fares, no surprises.", color: "accent" },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group cursor-pointer p-8 rounded-2xl bg-white shadow-md hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up delay-100"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`w-16 h-16 ${feature.color === 'primary' ? 'bg-primary-100' : feature.color === 'secondary' ? 'bg-secondary-100' : 'bg-accent-100'} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className={`w-8 h-8 ${feature.color === 'primary' ? 'text-primary-500' : feature.color === 'secondary' ? 'text-secondary-500' : 'text-accent-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-500 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

   
      
    </div>
  )
}

export default WhyChooseUs
