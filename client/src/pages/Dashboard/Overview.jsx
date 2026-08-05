

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, Star, Users, DollarSign, Clock, TrendingUp, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import DriverUpgradeBanner from '../DriverBanner';
import UserLocationCard from '../location/LocationCard';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Overview = () => {
  const [stats, setStats] = useState(null);
    const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [details, setDetails] = useState(null)
const [hireCount, setHireCount] =useState(null)
  const token = localStorage.getItem('token');


  useEffect(() => {
    const fetchHireCount = async() => {
         if (!token) {
        toast.error('Please log in to view your dashboard');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire/hirecount`, {
             headers: { Authorization: `Bearer ${token}` },
        })
        setHireCount(res.data.totalHire);
        console.log(res.data.totalHire)
      } catch (error) {
        console.error('Error fetching hire count:', error);
        toast.error('Could not load hire count');
      }
    }
    fetchHireCount();
  }, [token])

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        toast.error('Please log in to view your dashboard');
        setLoading(false);
        return;
      }

      try {
       const [statsRes, timelineRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/stats-timeline`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
   setStats(statsRes.data.stats);
        setDetails(statsRes.data.user);
        setTimeline(timelineRes.data.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError('Failed to load dashboard statistics');
        toast.error('Could not load your overview');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const referralLink = details?.referralCode
    ? `${window.location.origin}/signup?ref=${details.referralCode}`
    : null;

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600">{error || 'No data available'}</p>
      </div>
    );
  }

  const isDriver = stats.role === 'driver';

  const ReferralShareSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-100 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="h-6 w-6 text-black" />
        <h3 className="text-xl font-bold text-black">
          Invite Friends & Earn Rewards
        </h3>
      </div>

      <p className="text-black  mb-4 text-sm">
        Share your unique link — when someone signs up and joins using it, you earn points!
      </p>

      {referralLink ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-4 py-3 bg-white  border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium focus:outline-none"
          />
          <button
            onClick={copyReferralLink}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Loading your referral link...</p>
      )}

      <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-indigo-800/40 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-black">Referral Points</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {details.referralPoints || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-black">Successful Referrals</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {details.referralCount || 0}
          </p>
        </div>
      </div>
    </motion.div>
  );

    // ─── Shared Period Cards ───────────────────────────────────────────────
  const renderPeriodCards = () => {
    if (!timeline?.periods) return null;

    const data = isDriver ? timeline.periods.earnings : timeline.periods.paid;
    if (!data) return null;

    const title = isDriver ? "Your Earnings" : "Amount Paid";
 

    const periods = [
  { label: "Today", value: data.today, color: "bg-blue-50 border-blue-200 text-blue-800" },
  { label: "Last 7 Days", value: data.thisWeek, color: "bg-purple-50 border-purple-200 text-purple-800" },
  { label: "Last 30 Days", value: data.last30Days || 0, color: "bg-amber-50 border-amber-200 text-amber-800" },
  { label: "Last 3 Months", value: data.last3Months || 0, color: "bg-pink-50 border-pink-200 text-pink-800" },
  { label: "Last 6 Months", value: data.last6Months || 0, color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  { label: "This Month", value: data.thisMonth, color: "bg-green-50 border-green-200 text-green-800" },
  { label: "This Year", value: data.thisYear, color: "bg-gray-50 border-gray-200 text-gray-800" },
];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-5 mt-8">
        {periods.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={`p-5 rounded-2xl shadow-sm border ${p.color}`}
          >
            <p className="text-sm font-medium opacity-80">{p.label}</p>
            <p className="text-2xl font-bold mt-1">
              ₦{(p.value || 0).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>
    );
  };

  // ─── Last 30 Days Trend Chart (simple daily bars) ──────────────────────
  const renderLast30DaysTrend = () => {
  const dailyData = timeline.periods.earnings?.last30DaysDaily || [];

// assuming oldest first
const labels = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 29 + i);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

    if (!timeline?.periods) return null;

    const amount = isDriver
      ? timeline.periods.earnings?.last30Days || timeline.periods.earnings?.thisMonth || 0
      : timeline.periods.paid?.last30Days    || timeline.periods.paid?.thisMonth    || 0;

    const trendData = {
      labels,
      datasets: [{
        label: isDriver ? 'Your Earnings' : 'Amount Paid',
        // data: [amount],
        data: dailyData,
        backgroundColor: isDriver ? '#10B981' : '#3B82F6',
        borderRadius: 8,
      }]
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          Last 30 Days Trend
        </h3>
        {amount > 0 ? (
          <Bar
            data={trendData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No activity in the last 30 days
          </div>
        )}
      </motion.div>
    );
  };

  const renderQuarterTrend = () => {
  if (!timeline?.periods) return null;

  const data = isDriver ? timeline.periods.earnings : timeline.periods.paid;

  const chartData = {
    labels: ['Last 30 Days', 'Last 3 Months', 'Last 6 Months'],
    datasets: [{
      label: isDriver ? 'Earnings' : 'Amount Paid',
      data: [
        data.last30Days || 0,
        data.last3Months || 0,
        data.last6Months || 0
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6'],
      borderRadius: 8,
    }]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-indigo-600" />
        Earnings Growth Timeline
      </h3>

      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }}
      />
    </motion.div>
  );
};


  // ─── Driver View ─────────────────────────────────────────────────────
  if (isDriver) {
    const {
      uniqueClientsHiredHim = 0,
      totalPaidAmount = 0,
      paidClientsCount = 0,
      totalHiresMade = 0,
      timesHired = 0,
      adminCommissionAmount = 0,
      driverShareAmount = 0,
      totalBookedHours = 0,
      averageRating = '0.0',
      totalReviewsReceived = 0,
      hireStatusBreakdown = { pending: 0, pendingApproval: 0, active: 0, paid: 0 },
      adminCommissionPercentage = 30,
    } = stats;

    const pieData = {
      labels: ['Pending', 'Awaiting Approval', 'Active', 'Paid'],
      datasets: [{
        data: [
          hireStatusBreakdown.pending,
          hireStatusBreakdown.pendingApproval,
          hireStatusBreakdown.active,
          hireStatusBreakdown.paid
        ],
        backgroundColor: ['#FBBF24', '#F97316', '#10B981', '#3B82F6'],
        borderWidth: 1,
      }]
    };

    const barData = {
      labels: ['Total Paid', 'Admin Commission', 'Your Share'],
      datasets: [{
        label: 'Amount (₦)',
        data: [totalPaidAmount, adminCommissionAmount, driverShareAmount],
        backgroundColor: ['#3B82F6', '#EF4444', '#10B981'],
        borderRadius: 8,
      }]
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 p-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {details?.firstName || 'Driver'}!
          </h1>
          <DriverUpgradeBanner/>
          <p className="text-gray-600 mt-2">Your performance overview</p>
        </div>
<ReferralShareSection />
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-lg border">
          <Car className="h-10 w-10 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600">Total Hires Made</p>
          <p className="text-3xl font-bold">{hireCount}</p>
        </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          >
            <Users className="h-10 w-10 text-blue-600 mb-3" />
            <p className="text-sm text-gray-600 font-medium">Clients Hired You</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueClientsHiredHim}</p>
          </motion.div>
          <motion.div 
  whileHover={{ y: -5 }}
  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
>
  <DollarSign className="h-10 w-10 text-green-600 mb-3" />
  <p className="text-sm text-gray-600 font-medium">Total Amount Paid for You</p>
  <p className="text-3xl font-bold text-gray-900 mt-1">
    ₦{stats.totalPaidAmount?.toLocaleString() || '0'}
  </p>
</motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          >
            <DollarSign className="h-10 w-10 text-green-600 mb-3" />
            <p className="text-sm text-gray-600 font-medium">Your Share ({100 - stats.adminCommissionPercentage}%)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₦{driverShareAmount.toLocaleString()}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          >
            <Star className="h-10 w-10 text-yellow-600 mb-3 fill-current" />
            <p className="text-sm text-gray-600 font-medium">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {averageRating} <span className="text-sm text-gray-500">({totalReviewsReceived} reviews)</span>
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          >
            <Clock className="h-10 w-10 text-purple-600 mb-3" />
            <p className="text-sm text-gray-600 font-medium">Total Hours Booked</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalBookedHours}</p>
          </motion.div>

          <motion.div 
  whileHover={{ y: -5 }}
  className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl shadow-lg border border-emerald-200"
>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-emerald-700 font-medium">Clients Who Paid</p>
      <p className="text-3xl font-bold text-emerald-800 mt-2">
        {stats.paidClientsCount || 0}
      </p>
    </div>
    <CheckCircle className="h-12 w-12 text-emerald-600 opacity-80" />
  </div>
</motion.div>
        </div>
  {renderPeriodCards()}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Earnings Breakdown ({adminCommissionPercentage}% Admin)
            </h3>
            {totalPaidAmount > 0 ? (
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No paid hires yet
              </div>
            )}
          </motion.div>
   {renderLast30DaysTrend()}
{renderQuarterTrend()}
   

  
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-purple-600" />
              Hire Status Distribution
            </h3>
            {Object.values(hireStatusBreakdown).some(v => v > 0) ? (
              <Doughnut 
                data={pieData} 
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} 
              />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No hire activity yet
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ─── Client View ─────────────────────────────────────────────────────
  const {
    totalHiresMade = 0,
    uniqueDriversHired = 0,
    totalAmountSpent = 0,
    hireStatusBreakdown = { awaitingApproval: 0, active: 0 },
  } = stats;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {stats.user?.firstName || 'Client'}!
        </h1>
        <p className="text-gray-600 mt-2">Your hiring overview</p>
      </div>

   <ReferralShareSection />
   <UserLocationCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-lg border">
          <Car className="h-10 w-10 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600">Total Hires Made</p>
          <p className="text-3xl font-bold">{totalHiresMade}</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-lg border">
          <Users className="h-10 w-10 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Unique Drivers</p>
          <p className="text-3xl font-bold">{uniqueDriversHired}</p>
        </motion.div>

     <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-lg border">
  <DollarSign className="h-10 w-10 text-green-600 mb-2" />
  <p className="text-sm text-gray-600">Total Amount Paid</p>
  <p className="text-3xl font-bold">₦{stats.totalAmountPaid?.toLocaleString() || '0'}</p>
</motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-lg border">
          <Clock className="h-10 w-10 text-amber-600 mb-2" />
          <p className="text-sm text-gray-600">Active Hires</p>
          <p className="text-3xl font-bold">{hireStatusBreakdown.active || 0}</p>
        </motion.div>
      </div>
      {renderPeriodCards()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-xl font-bold mb-4">Spending & Activity</h3>
          <Bar 
            data={{
           labels: ['Total Paid', 'Active Hires', 'Awaiting Approval'],
  datasets: [{
    label: 'Value',
    data: [
      stats.totalAmountPaid || 0,
      hireStatusBreakdown.active || 0,
      hireStatusBreakdown.awaitingApproval || 0
    ],
    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
    borderRadius: 8,
  }]
            }} 
            options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} 
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-xl font-bold mb-4">Hire Status</h3>
          <Doughnut 
            data={{
              labels: ['Active', 'Awaiting Approval'],
              datasets: [{
                data: [hireStatusBreakdown.active || 0, hireStatusBreakdown.awaitingApproval || 0],
                backgroundColor: ['#10B981', '#F59E0B'],
                borderWidth: 1,
              }]
            }} 
            options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} 
          />
        </div>
      </div>
        {renderLast30DaysTrend()}
        {renderQuarterTrend()}
    </motion.div>
  );
};

export default Overview;











































































