// src/pages/Admin/SubscriptionPlansAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';

const SubscriptionPlansAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'fulltime_hire',
    planName: 'premium',
    amount: '',
    currency: 'NGN',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);

  const types = ['fulltime_hire', 'hire_on_demand', 'driver_shop'];
  const planNames = ['premium', 'classic', 'gold', 'chauffeur', 'within-state', 'interstate'];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/subscription-plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setPlans(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/subscription-plans`,
          { ...form, _id: editingId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
        );
        toast.success('Plan updated');
      } else {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/subscription-plans`,
          form,
          { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
        );
        toast.success('Plan created');
      }
      fetchPlans();
      setForm({ type: 'fulltime_hire', planName: 'premium', amount: '', currency: 'NGN', description: '' });
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setForm({
      type: plan.type,
      planName: plan.planName,
      amount: plan.amount,
      currency: plan.currency,
      description: plan.description || ''
    });
    setEditingId(plan._id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Manage Subscription Plans</h1>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-6">
          {editingId ? 'Edit Plan' : 'Create New Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              {types.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">planName</label>
            <select
              name="planName"
              value={form.planName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              {planNames.map(p => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount (₦)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <input
              type="text"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {editingId ? 'Update Plan' : 'Create Plan'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ type: 'fulltime_hire', planName: 'premium', amount: '', currency: 'NGN', description: '' });
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List of Plans */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">planName</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Currency</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.map(plan => (
              <tr key={plan._id}>
                <td className="px-6 py-4">{plan.type.replace('_', ' ').toUpperCase()}</td>
                <td className="px-6 py-4">{plan.planName.toUpperCase()}</td>
                <td className="px-6 py-4 font-bold">₦{plan.amount.toLocaleString()}</td>
                <td className="px-6 py-4">{plan.currency}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-indigo-600 hover:text-indigo-800 mr-3"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionPlansAdmin;