// // src/components/DriverCategoryCarousel.jsx
// import React, { useRef } from "react";
// import { useNavigate } from "react-router-dom";

// const categories = [
//   "full-time", "part-time", "weekend", "short-time", "airport-pickup",
//   "outstation-travel", "night-out-designated", "executive-chauffeur",
//   "family-child-friendly", "school-bus", "tanker-hazmat", "retained-monthly",
//   "pet-friendly", "truck-driver", "interstate-driver", "long-haul-driver",
//   "delivery-driver", "ride-share-driver", "tour-guide-driver",
//   "senior-citizen-driver", "disabled-assistance-driver", "bike-courier",
//   "medical-transport-driver", "event-transport-driver",
//   "luxury-vehicle-driver", "eco-friendly-driver", "valet-driver",
//   "chauffeur-driver", "personal-driver", "corporate-driver",
// ];

// /**
//  * 🔹 Pricing Logic
//  * You only edit numbers here
//  */
// const basePrices = {
//   perDay: 20000,
//   intrastate: 35000,
//   interstate: 70000,
//   southwest: 60000,
//   north: 110000,
//   east: 85000,
// };

// // Category multipliers
// const categoryMultiplier = (category) => {
//   if (category.includes("luxury") || category.includes("executive")) return 1.8;
//   if (category.includes("truck") || category.includes("tanker")) return 2.2;
//   if (category.includes("interstate") || category.includes("long-haul")) return 2.0;
//   if (category.includes("medical")) return 1.6;
//   if (category.includes("corporate")) return 1.5;
//   if (category.includes("bike")) return 0.6;
//   if (category.includes("part-time") || category.includes("short-time")) return 0.8;
//   return 1;
// };

// // Final price generator
// const getPricingForCategory = (category) => {
//   const multiplier = categoryMultiplier(category);

//   const format = (amount) =>
//     `₦${Math.round(amount).toLocaleString()}`;

//   return {
//     perDay: format(basePrices.perDay * multiplier),
//     intrastate: format(basePrices.intrastate * multiplier),
//     interstate: format(basePrices.interstate * multiplier),
//     southwest: format(basePrices.southwest * multiplier),
//     north: format(basePrices.north * multiplier),
//     east: format(basePrices.east * multiplier),
//   };
// };

// const formatTitle = (text) =>
//   text
//     .split("-")
//     .map(w => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(" ");

// const DriverCategoryCarousel = () => {
//   const scrollRef = useRef(null);
//   const navigate = useNavigate();

//   const scroll = (direction) => {
//     if (!scrollRef.current) return;
//     scrollRef.current.scrollBy({
//       left: direction === "left" ? -350 : 350,
//       behavior: "smooth",
//     });
//   };

//   return (
//     <section className="relative py-16 bg-gradient-to-b from-white to-purple-50">
//       <div className="max-w-7xl mx-auto px-6">

//         {/* Header */}
//         <div className="flex items-center  justify-between mb-10">
//           <div>
//             <h2 className="text-3xl md:text-4xl items-center font-bold">
//               Driver Categories & Pricing
//             </h2>
//             <p className="text-gray-600 mt-2 max-w-xl">
//               Transparent pricing tailored to each driver category and travel region.
//             </p>
//           </div>

//           {/* Controls */}
//           <div className="hidden md:flex gap-3">
//             <button
//               onClick={() => scroll("left")}
//               className="w-12 h-12 rounded-full bg-white shadow hover:bg-purple-100 transition"
//             >
//               ←
//             </button>
//             <button
//               onClick={() => scroll("right")}
//               className="w-12 h-12 rounded-full bg-white shadow hover:bg-purple-100 transition"
//             >
//               →
//             </button>
//           </div>
//         </div>

//         {/* Carousel */}
//         <div
//           ref={scrollRef}
//           className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
//         >
//           {categories.map((cat, idx) => {
//             const pricing = getPricingForCategory(cat);

//             return (
//               <div
//                 key={idx}
//                 className="
//                   min-w-[85%] sm:min-w-[45%] lg:min-w-[20%]
//                   bg-white rounded-3xl shadow-xl p-6
//                   hover:shadow-2xl transition transform hover:-translate-y-1
//                 "
//               >
//                 <h3 className="text-xl font-bold mb-4">
//                   {formatTitle(cat)}
//                 </h3>

//                 {/* Pricing */}
//                 <div className="space-y-3 text-sm">
//                   <PriceRow label="Per Day" value={pricing.perDay} />
//                   <PriceRow label="Intrastate" value={pricing.intrastate} />
//                   <PriceRow label="Interstate" value={pricing.interstate} />

//                   <div className="border-t pt-3 mt-3">
//                     <PriceRow label="South West" value={pricing.southwest} />
//                     <PriceRow label="North" value={pricing.north} />
//                     <PriceRow label="East" value={pricing.east} />
//                   </div>
//                 </div>

//                 {/* CTA */}
//                 <button
//                   onClick={() =>
//                     navigate(`/signup?type=client&category=${cat}`)
//                   }
//                   className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
//                 >
//                   Hire {formatTitle(cat)}
//                 </button>
//               </div>
//             );
//           })}
//         </div>

//         {/* Mobile hint */}
//         <p className="text-center text-sm text-gray-500 mt-4 md:hidden">
//           Swipe to explore more driver categories
//         </p>
//       </div>
//     </section>
//   );
// };

// /* Small reusable price row */
// const PriceRow = ({ label, value }) => (
//   <div className="flex justify-between text-gray-700">
//     <span>{label}</span>
//     <span className="font-semibold">{value}</span>
//   </div>
// );

// export default DriverCategoryCarousel;





// src/components/DriverCategoryCarousel.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";

const DriverCategoryCarousel = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real pricing categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/pricing`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        if (res.data.success && res.data.pricingConfigs?.length > 0) {
          setCategories(res.data.pricingConfigs);
        } else {
          setError("No pricing categories available");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Could not load driver categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -350 : 350;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const formatTitle = (text) =>
    text
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const formatCurrency = (value) =>
    value ? `₦${Number(value).toLocaleString()}` : "—";

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center bg-gradient-to-b from-white to-purple-50">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Loading driver categories...</p>
      </div>
    );
  }

  if (error || categories.length === 0) {
    return (
      <div className="py-16 text-center bg-gradient-to-b from-white to-purple-50">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          {error || "No categories available"}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Please check back later or contact support.
        </p>
      </div>
    );
  }

  return (
    <section className="relative py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Driver Categories & Pricing
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Transparent real-time rates tailored to each category and travel type.
            </p>
          </div>

          {/* Desktop Arrows */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-purple-50 transition flex items-center justify-center text-indigo-600 hover:text-indigo-800"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-purple-50 transition flex items-center justify-center text-indigo-600 hover:text-indigo-800"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-6 snap-x snap-mandatory"
        >
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="
                min-w-[85%] sm:min-w-[45%] lg:min-w-[30%] xl:min-w-[24%]
                bg-white rounded-3xl shadow-xl p-6 border border-gray-100
                hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1
                snap-center
              "
            >
              <h3 className="text-xl font-bold mb-5 text-gray-900 capitalize">
                {formatTitle(cat.category)}
              </h3>

              {/* Pricing Table */}
              <div className="space-y-4 text-sm mb-6">
                <PriceRow label="Hourly" value={formatCurrency(cat.hourlyRate)} />
                <PriceRow label="Daily" value={formatCurrency(cat.dailyRate)} />
                <PriceRow label="Weekly" value={formatCurrency(cat.weeklyRate)} />
                <PriceRow label="Monthly" value={formatCurrency(cat.monthlyRate)} />
              </div>

              {/* CTA */}
              <button
                onClick={() =>
                  navigate(`/signup?type=client&category=${cat.category}`)
                }
                className="
                  w-full py-4 rounded-2xl
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  text-white font-semibold text-lg
                  hover:shadow-xl hover:shadow-indigo-500/30
                  transition-all duration-300 active:scale-98
                "
              >
                Hire {formatTitle(cat.category)}
              </button>
            </div>
          ))}
        </div>

        {/* Mobile swipe hint */}
        <p className="text-center text-sm text-gray-500 mt-6 md:hidden">
          Swipe left/right to explore more categories
        </p>
      </div>
    </section>
  );
};

/* Reusable Price Row Component */
const PriceRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-gray-700">
    <span className="font-medium">{label}</span>
    <span className="font-bold text-gray-900">{value || "—"}</span>
  </div>
);

const formatTitle = (text) =>
  text
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default DriverCategoryCarousel;