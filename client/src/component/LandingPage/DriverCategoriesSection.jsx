

// // src/components/DriverCategories.jsx
// import React, { useRef } from "react";
// import { motion } from "framer-motion";
// import { Car } from "lucide-react";
// import Airport from "../../assets/Airport.jpg"
// import Exective from "../../assets/ex.jpg"
// import short from "../../assets/short.jpg"
// import tanker from "../../assets/tanker.jpg"
// import parttime from "../../assets/parttime.jpg"
// import weekend from "../../assets/weekend.jpg"
// import fulltime from "../../assets/full.jpg"
// import fulltimedriver from "../../assets/full-TimeDriver.jpg"
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import {Link} from "react-router-dom"
// const driverTypes = [
//   {
//     type: "full-time",
//     title: "Full-Time Driver",
//     description:
//       "Dedicated professional driver for daily commutes, office runs, and personal errands.",
//     image: fulltime,
//     gradient: "from-blue-600 to-indigo-700",
//   },
//   {
//     type: "part-time",
//     title: "Part-Time Driver",
//     description:
//       "Flexible driver available for specific hours or days. Perfect for occasional needs.",
//     image: parttime,
//     gradient: "from-purple-600 to-pink-600",
//   },
//   {
//     type: "weekend",
//     title: "Weekend Driver",
//     description:
//       "Stress-free weekend rides for family outings, events, or short getaways.",
//     image: weekend,
//     gradient: "from-orange-500 to-red-600",
//   },
//   {
//     type: "short-time",
//     title: "Short-Time Driver",
//     description:
//       "Quick, on-demand rides for a few hours — ideal for meetings or errands.",
//     image: short,
//     gradient: "from-teal-500 to-cyan-600",
//   },
//   {
//     type: "airport-pickup",
//     title: "Airport Transfer",
//     description:
//       "Punctual airport pickups & drop-offs with flight monitoring and meet & greet.",
//     image: Airport,
//     gradient: "from-indigo-600 to-blue-700",
//   },
//   {
//     type: "executive-chauffeur",
//     title: "Executive Chauffeur",
//     description:
//       "Premium corporate chauffeur service in luxury vehicles for VIPs and executives.",
//     image: Exective,
//     gradient: "from-gray-800 to-black",
//   },
//   {
//     type: "tanker-hazmat",
//     title: "Tanker & Hazmat",
//     description:
//       "Certified drivers for hazardous materials and tanker transport — safety first.",
//     image: tanker,
//     gradient: "from-red-600 to-orange-700",
//   },
//   // {
//   //   type: "fulltimedriver",
//   //   title: "Full-Time Professional",
//   //   description:
//   //     "Reliable long-term driver for consistent daily and weekly needs.",
//   //   image: fulltimedriver,
//   //   gradient: "from-emerald-600 to-green-700",
//   // },
// ];

// const DriverCategories = () => {
//   const scrollRef = useRef(null);

//   const scroll = (direction) => {
//     if (!scrollRef.current) return;
//     const scrollAmount = direction === "left" ? -320 : 320;
//     scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
//   };

//   const formatTitle = (text) =>
//     text
//       .split("-")
//       .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//       .join(" ");

//   return (
//     <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center mb-12 md:mb-16"
//         >
//           <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 md:mb-6 tracking-tight">
//             Choose Your Perfect Driver
//           </h2>
//           <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
//             Specialized, verified drivers for every lifestyle and need
//           </p>
//         </motion.div>

//         {/* Carousel */}
//         <div className="relative">
//           {/* Arrows - visible always, styled beautifully */}
//           <button
//             onClick={() => scroll("left")}
//             className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-lg shadow-xl flex items-center justify-center text-indigo-700 hover:bg-indigo-50 transition-all hover:scale-110 active:scale-95"
//             aria-label="Previous slide"
//           >
//             <ChevronLeft size={28} />
//           </button>

//           <button
//             onClick={() => scroll("right")}
//             className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-lg shadow-xl flex items-center justify-center text-indigo-700 hover:bg-indigo-50 transition-all hover:scale-110 active:scale-95"
//             aria-label="Next slide"
//           >
//             <ChevronRight size={28} />
//           </button>

//           {/* Cards Container */}
//           <div
//             ref={scrollRef}
//             className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-6 snap-x snap-mandatory"
//           >
//             {driverTypes.map((driver, index) => (
//               <motion.div
//                 key={driver.type}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1, duration: 0.6 }}
//                 className="
//                   min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[23%] xl:min-w-[20%]
//                   bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100
//                   hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3
//                   snap-center
//                 "
//               >
//                 {/* Image Section */}
//                 <div className="relative h-56 md:h-64 overflow-hidden">
//                   <img
//                     src={driver.image}
//                     alt={driver.title}
//                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

//                   {/* Gradient Icon Badge */}
//                   <div
//                     className={`absolute top-4 left-4 p-3 md:p-4 rounded-2xl bg-gradient-to-br ${driver.gradient} text-white shadow-xl ring-2 ring-white/20`}
//                   >
//                     {/* <Car size={24} className="md:size-28" /> */}
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-5 md:p-6">
//                   <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 line-clamp-1">
//                     {formatTitle(driver.type)}
//                   </h3>

//                   <p className="text-sm md:text-base text-gray-600 mb-6 line-clamp-3">
//                     {driver.description}
//                   </p>
// <Link to='/login'>
//  <button
//                     onClick={() => navigate(`/login`)}
//                     className={`
//                       w-full py-3 md:py-4 rounded-2xl font-semibold text-white text-base md:text-lg
//                       bg-gradient-to-r ${driver.gradient}
//                       hover:shadow-xl hover:shadow-indigo-500/30
//                       transition-all duration-300 active:scale-98
//                     `}
//                   >
//                     Hire Now
//                   </button>
// </Link>
                 
//                 </div>
//               </motion.div>
//             ))}
//           </div>

//           {/* Mobile Swipe Hint */}
//           <p className="text-center text-sm text-gray-500 mt-6 md:hidden">
//             Swipe left/right to explore all categories
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DriverCategories;








// src/components/DriverCategories.jsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Car } from "lucide-react";
import Airport from "../../assets/Airport.jpg"
import Exective from "../../assets/ex.jpg"
import short from "../../assets/short.jpg"
import tanker from "../../assets/tanker.jpg"
import parttime from "../../assets/parttime.jpg"
import weekend from "../../assets/weekend.jpg"
import fulltime from "../../assets/full.jpg"
import fulltimedriver from "../../assets/full-TimeDriver.jpg"
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

const driverTypes = [
  {
    type: "full-time",
    title: "Full-Time Driver",
    description:
      "Dedicated professional driver for daily commutes, office runs, and personal errands.",
    image: fulltime,
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    type: "part-time",
    title: "Part-Time Driver",
    description:
      "Flexible driver available for specific hours or days. Perfect for occasional needs.",
    image: parttime,
    gradient: "from-purple-600 to-pink-600",
  },
  {
    type: "weekend",
    title: "Weekend Driver",
    description:
      "Stress-free weekend rides for family outings, events, or short getaways.",
    image: weekend,
    gradient: "from-orange-500 to-red-600",
  },
  {
    type: "short-time",
    title: "Short-Time Driver",
    description:
      "Quick, on-demand rides for a few hours — ideal for meetings or errands.",
    image: short,
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    type: "airport-pickup",
    title: "Airport Transfer",
    description:
      "Punctual airport pickups & drop-offs with flight monitoring and meet & greet.",
    image: Airport,
    gradient: "from-indigo-600 to-blue-700",
  },
  {
    type: "executive-chauffeur",
    title: "Executive Chauffeur",
    description:
      "Premium corporate chauffeur service in luxury vehicles for VIPs and executives.",
    image: Exective,
    gradient: "from-gray-800 to-black",
  },
  {
    type: "tanker-hazmat",
    title: "Tanker & Hazmat",
    description:
      "Certified drivers for hazardous materials and tanker transport — safety first.",
    image: tanker,
    gradient: "from-red-600 to-orange-700",
  },
  // {
  //   type: "fulltimedriver",
  //   title: "Full-Time Professional",
  //   description:
  //     "Reliable long-term driver for consistent daily and weekly needs.",
  //   image: fulltimedriver,
  //   gradient: "from-emerald-600 to-green-700",
  // },
];

const DriverCategories = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Auth state (same pattern as Navbar)
  const { user, token } = useSelector((state) => state.user);
  const isAuthenticated = !!token || !!user;

  const handleHireNow = () => {
    if (isAuthenticated) {
      navigate('/dashboard?tab=drivers');
    } else {
      navigate('/login');
    }
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const formatTitle = (text) =>
    text
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 md:mb-6 tracking-tight">
            Choose Your Perfect Driver
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized, verified drivers for every lifestyle and need
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Arrows - visible always, styled beautifully */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-lg shadow-xl flex items-center justify-center text-indigo-700 hover:bg-indigo-50 transition-all hover:scale-110 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-lg shadow-xl flex items-center justify-center text-indigo-700 hover:bg-indigo-50 transition-all hover:scale-110 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight size={28} />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pb-6 snap-x snap-mandatory"
          >
            {driverTypes.map((driver, index) => (
              <motion.div
                key={driver.type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="
                  min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[23%] xl:min-w-[20%]
                  bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100
                  hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3
                  snap-center
                "
              >
                {/* Image Section */}
                <div className="relative h-56 md:h-64 overflow-hidden">
                  <img
                    src={driver.image}
                    alt={driver.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Gradient Icon Badge */}
                  <div
                    className={`absolute top-4 left-4 p-3 md:p-4 rounded-2xl bg-gradient-to-br ${driver.gradient} text-white shadow-xl ring-2 ring-white/20`}
                  >
                    {/* <Car size={24} className="md:size-28" /> */}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                    {formatTitle(driver.type)}
                  </h3>

                  <p className="text-sm md:text-base text-gray-600 mb-6 line-clamp-3">
                    {driver.description}
                  </p>

                  <button
                    onClick={handleHireNow}
                    className={`
                      w-full py-3 md:py-4 rounded-2xl font-semibold text-white text-base md:text-lg
                      bg-gradient-to-r ${driver.gradient}
                      hover:shadow-xl hover:shadow-indigo-500/30
                      transition-all duration-300 active:scale-98
                    `}
                  >
                    Hire Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Swipe Hint */}
          <p className="text-center text-sm text-gray-500 mt-6 md:hidden">
            Swipe left/right to explore all categories
          </p>
        </div>
      </div>
    </section>
  );
};

export default DriverCategories;