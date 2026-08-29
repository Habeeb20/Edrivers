// src/pages/MyRentedCars.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';           // optional – npm install date-fns
import { Car, Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MyRentedCars() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchMyRentals = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token'); // ← adjust to your auth method

        const res = await axios.get(`${backendUrl}/api/rent-car/rentedcars`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setRentals(res.data.rentals || []);
        } else {
          setError(res.data.message || 'Failed to load rentals');
        }
      } catch (err) {
        console.error('My rentals fetch error:', err);
        setError(
          err.response?.data?.message ||
          'Could not load your rented cars. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyRentals();
  }, [backendUrl]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid:    'bg-blue-100 text-blue-800 border-blue-300',
      active:  'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };

    const icons = {
      pending: <Clock className="h-4 w-4" />,
      paid:    <DollarSign className="h-4 w-4" />,
      active:  <CheckCircle className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status] || null}
        {status || 'unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Rented Cars</h1>
        <span className="text-sm text-gray-500">
          {rentals.length} {rentals.length === 1 ? 'rental' : 'rentals'}
        </span>
      </div>

      {rentals.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No rentals yet</h3>
          <p className="mt-2 text-gray-600">click on rent a car tab to rent your car.</p>
       {/* <Link
  to="/dashboard?tab=postcar"
  className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
>
  Rent your car
</Link> */}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {rentals.map((rental) => (
            <div
              key={rental._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Car Image / Placeholder */}
              <div className="h-48 bg-gray-100 relative">
                {rental.car?.photos?.[0] ? (
                  <img
                    src={rental.car.photos[0]}
                    alt={`${rental.car.make} ${rental.car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Car size={64} />
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rental.car?.make} {rental.car?.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {rental.car?.year} • {rental.car?.plateNumber}
                    </p>
                  </div>
                  {getStatusBadge(rental.rentalDetails?.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {rental.rentalDetails?.rentedAt &&
                        format(new Date(rental.rentalDetails.rentedAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{rental.rentalDetails?.durationDays} days</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{rental.rentalDetails?.location}</span>
                  </div>

                  <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>₦{rental.rentalDetails?.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-sm">
                    <p className="text-gray-600">Owner</p>
                    <p className="font-medium">{rental.car?.owner?.name || '—'}</p>
                  </div>

                  {/* <Link
                    to={`/rentals/${rental._id}`} // ← optional detail page
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
                  >
                    View Details
                  </Link> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}