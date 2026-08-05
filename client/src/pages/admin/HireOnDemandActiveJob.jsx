// src/pages/Admin/HireOnDemandActiveJobs.jsx (example)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const HireOnDemandActiveJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/requests`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setJobs(res.data.activeRequests || []);
    } catch (err) {
      toast.error('Failed to load active hires');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Active Hire on Demand Jobs</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-xl">
          No active Hire on Demand jobs right now
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">Driver</th>
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Plan / Level</th>
                <th className="px-6 py-4 text-left">Started</th>
                <th className="px-6 py-4 text-left">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.jobId} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={job.driver.avatar} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium">{job.driver.name}</p>
                        <p className="text-sm text-gray-500">{job.driver.plan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {job.client ? job.client.name : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {job.job.travelType} / {job.job.serviceLevel}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(job.job.startedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ₦{job.job.amountPaid?.toLocaleString() || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HireOnDemandActiveJobs;