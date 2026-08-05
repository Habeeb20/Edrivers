// src/components/admin/PricingManagement.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, } from 'sonner';
import { 
  Edit2, Plus, Save, X, Trash2, DollarSign, Clock, Calendar, Loader2 
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/admin`;

// Predefined allowed categories – change these to match your actual vehicle/service types
const ALLOWED_CATEGORIES = [
  'full-time',
  // 'part-time',
  'weekend',
  'short/part-time',
  'inter-state',
  'one day',
  'airport-pickup',
  'outstation-travel',
  'night-out-designated',
  'executive-chauffeur',

  'school-bus',
  'tanker-driver',
  'retained-monthly',
  'pet-friendly',
];

const PricingManagement = () => {
  const [pricingConfigs, setPricingConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    hourlyRate: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    description: '',
    callOutCharge:'',
    isActive: true
  });
  const [isCreating, setIsCreating] = useState(false);

  const token = localStorage.getItem('adminToken');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const fetchPricingConfigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/pricing`, config);
      setPricingConfigs(res.data.pricingConfigs || []);
      console.log('Fetched pricing configs:', res.data.pricingConfigs);
    } catch (error) {
      toast.error("Failed to load pricing configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingConfigs();
  }, []);

  // Get already used categories
  const usedCategories = new Set(pricingConfigs.map(item => item.category));

  const availableCategoriesForCreate = ALLOWED_CATEGORIES.filter(
    cat => !usedCategories.has(cat)
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startEdit = (item) => {
    setIsCreating(false);
    setEditingCategory(item.category);
    setFormData({
      category: item.category,
      hourlyRate: item.hourlyRate || '',
      dailyRate: item.dailyRate || '',
      weeklyRate: item.weeklyRate || '',
      monthlyRate: item.monthlyRate || '',
      description: item.description || '',
      callOutCharge: item.callOutCharge || '',
      isActive: item.isActive ?? true
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingCategory(null);
    setFormData({
      category: availableCategoriesForCreate[0] || '',
      hourlyRate: '',
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      description: '',
      callOutCharge: '',
      isActive: true
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setIsCreating(false);
    setFormData({ category: '', hourlyRate: '', dailyRate: '', weeklyRate: '', monthlyRate: '', description: '', callOutCharge: '', isActive: true });
  };

  const handleSave = async () => {
    if (!formData.category) {
      return toast.error("Please select a category");
    }

    if (isCreating && usedCategories.has(formData.category)) {
      return toast.error("This category already has pricing configured");
    }

    // At least one rate should be filled
    if (
      !formData.hourlyRate &&
      !formData.dailyRate &&
      !formData.weeklyRate &&
      !formData.monthlyRate
    ) {
      return toast.error("At least one rate must be provided");
    }

    try {
      const url = isCreating
        ? `${API_BASE}/pricing/${formData.category}`
        : `${API_BASE}/pricing/${editingCategory}`;

      await axios.put(url, formData, config);

      toast.success(isCreating ? "Category pricing created!" : "Pricing updated!");

      fetchPricingConfigs();
      cancelEdit();

    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to save pricing";
      toast.error(msg);
    }
  };

  const handleDeactivate = async (category) => {
    if (!window.confirm(`Deactivate pricing for "${category}"?`)) return;

    try {
      await axios.delete(`${API_BASE}/pricing/${category}`, config);
      toast.success(`"${category}" pricing deactivated`);
      fetchPricingConfigs();
    } catch (error) {
      toast.error("Failed to deactivate");
    }
  };

  const formatCurrency = (value) => {
    return value ? `₦${Number(value).toLocaleString()}` : '—';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Pricing Management</h1>
            <p className="text-gray-600 mt-1">Define rates per vehicle/service category</p>
          </div>

          <button
            onClick={startCreate}
            disabled={isCreating || availableCategoriesForCreate.length === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-md transition-all
              ${isCreating || availableCategoriesForCreate.length === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-xl hover:shadow-indigo-500/30 active:scale-98'}
            `}
          >
            <Plus size={18} />
            Add New Category Pricing
          </button>
        </div>

        {/* Form – Create or Edit */}
        {(isCreating || editingCategory) && (
          <div className="bg-white rounded-2xl shadow-lg p-7 mb-10 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isCreating ? 'Create Pricing for Category' : `Edit ${editingCategory}`}
              </h2>
              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-900">
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category – Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={!isCreating}
                  className={`
                    w-full px-4 py-3 rounded-lg border border-gray-300 bg-white
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed
                  `}
                >
                  {isCreating ? (
                    <>
                      <option value="">Select category...</option>
                      {availableCategoriesForCreate.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value={formData.category}>
                      {formData.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  )}
                </select>
              </div>

              {/* Rates */}
              <div className="space-y-5">
                {[
                  { key: 'hourlyRate',  label: 'Hourly',  icon: Clock },
                  { key: 'dailyRate',   label: 'Daily',   icon: Calendar },
                  { key: 'weeklyRate',  label: 'Weekly',  icon: Calendar },
                  { key: 'monthlyRate', label: 'Monthly', icon: Calendar }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label} Rate (₦)
                      </label>
                      <input
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="100"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Description + Status */}
              <div className="md:col-span-2 space-y-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g. Standard sedan with air conditioning, good for city rides..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Call-Out Charge (₦)
                  </label>
                  <input
                    type="number"
                    name="callOutCharge"
                    value={formData.callOutCharge}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="100"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700 font-medium">Active (used in calculations)</span>
                </label>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4">
              <button
                onClick={cancelEdit}
                className="px-7 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-98"
              >
                <Save size={18} />
                {isCreating ? 'Create Pricing' : 'Update Pricing'}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hourly</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Daily</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Weekly</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Monthly</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-3">
                        <Loader2 className="animate-spin" size={22} />
                        Loading pricing data...
                      </div>
                    </td>
                  </tr>
                ) : pricingConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      No pricing categories configured yet
                    </td>
                  </tr>
                ) : (
                  pricingConfigs.map(item => (
                    <tr key={item.category} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                        )}
                        {item.callOutCharge !== undefined && item.callOutCharge !== null && (
                          <div className="text-sm text-gray-500 mt-1">Call-Out Charge: {formatCurrency(item.callOutCharge)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">{formatCurrency(item.hourlyRate)}</td>
                      <td className="px-6 py-4">{formatCurrency(item.dailyRate)}</td>
                      <td className="px-6 py-4">{formatCurrency(item.weeklyRate)}</td>
                      <td className="px-6 py-4">{formatCurrency(item.monthlyRate)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          {item.isActive && (
                            <button
                              onClick={() => handleDeactivate(item.category)}
                              className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Deactivate"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default PricingManagement;