// src/pages/Admin/PricingDistancePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';

const PricingDistancePage = () => {
  const [pricings, setPricings] = useState([]);           // Fetched from /api/admin/pricing
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newTier, setNewTier] = useState({
    minKm: '',
    maxKm: '',
    pricePerKm: '',
    fixedBasePrice: 0,
    description: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchPricings();
  }, []);

  const fetchPricings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/pricing`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }
      );

      if (res.data.success) {
        setPricings(res.data.pricingConfigs || []);
      } else {
        throw new Error(res.data.message || 'Failed to fetch');
      }
    } catch (err) {
      toast.error('Failed to load pricing categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (pricing) => {
    setEditingCategory(pricing.category);
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormError('');
    setNewTier({ minKm: '', maxKm: '', pricePerKm: '', fixedBasePrice: 0, description: '' });
  };

  const addTier = () => {
    if (!newTier.minKm || !newTier.maxKm || !newTier.pricePerKm) {
      setFormError('Min KM, Max KM, and Price per KM are required');
      return;
    }

    if (Number(newTier.minKm) >= Number(newTier.maxKm)) {
      setFormError('Min KM must be less than Max KM');
      return;
    }

    const updatedPricings = pricings.map(p => {
      if (p.category === editingCategory) {
        return {
          ...p,
          tiers: [
            ...(p.tiers || []),
            {
              ...newTier,
              minKm: Number(newTier.minKm),
              maxKm: Number(newTier.maxKm),
              pricePerKm: Number(newTier.pricePerKm),
              fixedBasePrice: Number(newTier.fixedBasePrice || 0)
            }
          ]
        };
      }
      return p;
    });

    setPricings(updatedPricings);
    setNewTier({ minKm: '', maxKm: '', pricePerKm: '', fixedBasePrice: 0, description: '' });
    setFormError('');
  };

  const removeTier = (category, index) => {
    const updated = pricings.map(p => {
      if (p.category === category) {
        return {
          ...p,
          tiers: p.tiers.filter((_, i) => i !== index)
        };
      }
      return p;
    });
    setPricings(updated);
  };

  const savePricing = async (category) => {
    const pricing = pricings.find(p => p.category === category);
    if (!pricing || !pricing.tiers?.length) {
      toast.error('Add at least one tier before saving');
      return;
    }

    // Prepare clean payload for backend (only what it expects)
    const payload = {
      category: pricing.category,
      tiers: pricing.tiers,
      isActive: pricing.isActive ?? true
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/distance-pricing`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }
      );

      toast.success('Distance pricing saved successfully!');
      setEditingCategory(null);
      fetchPricings(); // Refresh from backend
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save pricing';
      toast.error(msg);
      console.error('Save error:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distance-Based Pricing (per KM)</h1>
          <p className="text-gray-600 mt-1">Manage per-km rates for driver categories</p>
        </div>
        <button
          onClick={fetchPricings}
          className="inline-flex items-center px-5 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
        >
          <Loader2 size={18} className="mr-2" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : pricings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <X size={64} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Pricing Categories Found</h3>
          <p className="text-gray-600 mt-2">
            Create pricing configurations first to enable distance-based rates.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pricings.map((pricing) => {
            const isEditing = editingCategory === pricing.category;

            return (
              <div
                key={pricing.category}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white flex justify-between items-center">
                  <h2 className="text-xl font-semibold capitalize">
                    {pricing.category.replace(/-/g, ' ')}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      pricing.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {pricing.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Table */}
                <div className="p-6">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 font-medium">Min KM</th>
                        <th className="pb-3 font-medium">Max KM</th>
                        <th className="pb-3 font-medium">Price/KM (₦)</th>
                        <th className="pb-3 font-medium">Base Fee (₦)</th>
                        <th className="pb-3 font-medium">Description</th>
                        {isEditing && <th className="pb-3"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.tiers?.length > 0 ? (
                        pricing.tiers.map((tier, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-4">{tier.minKm}</td>
                            <td className="py-4">{tier.maxKm}</td>
                            <td className="py-4">{tier.pricePerKm.toLocaleString()}</td>
                            <td className="py-4">{tier.fixedBasePrice.toLocaleString()}</td>
                            <td className="py-4">{tier.description || '-'}</td>
                            {isEditing && (
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => removeTier(pricing.category, idx)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isEditing ? 6 : 5} className="py-8 text-center text-gray-500">
                            No distance tiers added yet for this category
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Add Tier Form (only visible when editing) */}
                  {isEditing && (
                    <div className="mt-6 bg-gray-50 p-5 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4">Add New Distance Tier</h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input
                          type="number"
                          placeholder="Min KM"
                          value={newTier.minKm}
                          onChange={(e) => setNewTier({ ...newTier, minKm: e.target.value })}
                          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          placeholder="Max KM"
                          value={newTier.maxKm}
                          onChange={(e) => setNewTier({ ...newTier, maxKm: e.target.value })}
                          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          placeholder="Price per KM"
                          value={newTier.pricePerKm}
                          onChange={(e) => setNewTier({ ...newTier, pricePerKm: e.target.value })}
                          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          placeholder="Base Fee (optional)"
                          value={newTier.fixedBasePrice}
                          onChange={(e) => setNewTier({ ...newTier, fixedBasePrice: e.target.value })}
                          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={newTier.description}
                          onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                          className="p-3 border rounded-lg md:col-span-5 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {formError && (
                        <p className="text-red-600 mt-3 text-sm font-medium">{formError}</p>
                      )}

                      <button
                        onClick={addTier}
                        className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Plus size={18} /> Add Tier
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end gap-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          <X size={18} /> Cancel
                        </button>
                        <button
                          onClick={() => savePricing(pricing.category)}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <Save size={18} /> Save Pricing
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(pricing)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Edit size={18} /> Edit Pricing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PricingDistancePage;