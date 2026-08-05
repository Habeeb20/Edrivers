// src/components/admin/AnnouncementManager.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit2, Trash2, Bell } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 1,
    targetRole: 'provider',
    expiresAt: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/announcements/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setAnnouncements(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load announcements");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnn) {
        await axios.put(`${API_BASE_URL}/api/announcements/${editingAnn._id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        toast.success("Announcement updated");
      } else {
        await axios.post(`${API_BASE_URL}/api/announcements`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        toast.success("Announcement created successfully");
      }

      setShowForm(false);
      setEditingAnn(null);
      setFormData({ title: '', message: '', type: 'info', priority: 1, targetRole: 'provider', expiresAt: '' });
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (ann) => {
    setEditingAnn(ann);
    setFormData({
      title: ann.title,
      message: ann.message,
      type: ann.type,
      priority: ann.priority,
      targetRole: ann.targetRole,
      expiresAt: ann.expiresAt ? ann.expiresAt.split('T')[0] : '',
    });
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex mt-10 justify-between items-center mb-8">
        <div className="flex items-center mt-20 gap-3">
          <Bell size={28} className="text-indigo-600" />
          <h1 className="text-3xl font-bold">Manage Announcements</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingAnn(null); }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={20} /> New Announcement
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editingAnn ? "Edit Announcement" : "Create New Announcement"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border rounded-xl"
                required
              />

              <textarea
                placeholder="Announcement Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                className="w-full p-3 border rounded-xl"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="p-3 border rounded-xl"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                  <option value="success">Success</option>
                </select>

                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="p-3 border rounded-xl"
                >
                  <option value="provider">Driver Only</option>
                  <option value="client">Clients Only</option>
                  <option value="all">All Users</option>
                </select>
              </div>

              <input
                type="number"
                placeholder="Priority (1-3)"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                min="1"
                max="3"
                className="w-full p-3 border rounded-xl"
              />

              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full p-3 border rounded-xl"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingAnn(null); }}
                  className="flex-1 py-3 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  {editingAnn ? "Update" : "Create"} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann._id} className="bg-white border rounded-2xl p-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{ann.title}</h3>
                <span className={`text-xs px-3 py-1 rounded-full ${ann.priority === 3 ? 'bg-red-100 text-red-700' : ann.priority === 2 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  Priority {ann.priority}
                </span>
              </div>
              <p className="text-gray-600 mt-2 line-clamp-2">{ann.message}</p>
              <p className="text-xs text-gray-500 mt-3">
                Target: {ann.targetRole} • Posted: {new Date(ann.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => startEdit(ann)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(ann._id)} className="p-2 hover:bg-gray-100 rounded-lg text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementManager;