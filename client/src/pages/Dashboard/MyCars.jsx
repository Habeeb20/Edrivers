import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
const API = import.meta.env.VITE_BACKEND_URL;

const CLOUDINARY_UPLOAD_PRESET = "essential";
const CLOUDINARY_CLOUD_NAME = "dc0poqt9l";

export default function MyCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");

  /* ---------------- FETCH MY CARS ---------------- */
  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API}/api/rent-car/my-cars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars(res.data.cars);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    setUploading(true);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );
    const json = await res.json();
    setUploading(false);
    return json.secure_url;
  };

  /* ---------------- UPDATE CAR ---------------- */
  const updateCar = async () => {
    try {
      await axios.put(
        `${API}/api/rent-car/my-cars/${editingCar._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCar(null);
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* ---------------- DELETE CAR ---------------- */
  const deleteCar = async (carId) => {
    if (!confirm("Are you sure you want to delete this car?")) return;
    try {
      await axios.delete(`${API}/api/rent-car/my-cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCars();
      toast.success("Car deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Posted Cars</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {cars.map((car) => (
          <motion.div
            key={car._id}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-2xl shadow p-4"
          >
            <img
              src={car.photos?.[0]}
              className="h-48 w-full object-cover rounded-xl"
            />

            <div className="mt-3">
              <h3 className="text-xl font-semibold">
                {car.make} {car.model} ({car.year})
              </h3>
              <p className="text-sm text-gray-500">{car.location}</p>
              <p className="font-bold mt-1">₦{car.rentalPrice}/day</p>

              <span
                className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                  car.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : car.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {car.status}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingCar(car);
                  setForm(car);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCar(car._id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      <AnimatePresence>
        {editingCar && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h2 className="text-2xl font-bold mb-4">Edit Car</h2>

              <input
                className="w-full p-3 border rounded-xl mb-3"
                value={form.rentalPrice}
                onChange={(e) =>
                  setForm({ ...form, rentalPrice: e.target.value })
                }
                placeholder="Rental Price"
              />

              <input
                className="w-full p-3 border rounded-xl mb-3"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="Location"
              />

              <label className="block mb-2 font-semibold">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const url = await uploadImage(e.target.files[0]);
                  setForm({
                    ...form,
                    photos: [...(form.photos || []), url],
                  });
                }}
              />

              {uploading && (
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={updateCar}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingCar(null)}
                  className="flex-1 bg-gray-300 py-3 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
