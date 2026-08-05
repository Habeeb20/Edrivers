
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Award, ExternalLink } from "lucide-react";

const DriverUpgradeBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 shadow-lg text-white"
    >
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* Left Content */}
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-1">
              Boost Your Driver Opportunities 🚗
            </h3>
            <p className="text-sm text-white/90 max-w-xl">
              Keep your driver profile updated and get <span className="font-semibold">certified & verified</span>. 
              Verified drivers receive more client trust and higher hiring opportunities.
              Visit <span className="font-semibold">Essential NG</span> to complete your verification.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/90">
              <span className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                Stronger profile
              </span>

              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                Certification advantage
              </span>

              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                Higher client trust
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        {/* <a
          href="https://essentialng.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-3 rounded-xl shadow hover:bg-gray-100 transition"
        >
          Get Verified
          <ExternalLink className="h-4 w-4" />
        </a> */}
      </div>
    </motion.div>
  );
};

export default DriverUpgradeBanner;
