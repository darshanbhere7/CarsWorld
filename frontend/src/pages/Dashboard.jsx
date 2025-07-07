// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { socket } from "../lib/utils";

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
    // Listen for real-time booking updates
    socket.on("booking_updated", fetchBookings);
    return () => {
      socket.off("booking_updated", fetchBookings);
    };
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/cancel/${id}`);
      setMessage("❌ Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      setMessage("Failed to cancel booking.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Booked":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name} 👋</h2>

      {message && <p className="text-blue-600 mb-4">{message}</p>}

      <h3 className="text-lg font-semibold mb-3">Your Bookings:</h3>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border p-4 rounded bg-white shadow flex flex-col md:flex-row gap-4"
            >
              {/* Car Image */}
              {booking.car?.image ? (
                <img
                  src={booking.car.image}
                  alt={booking.car.name}
                  className="w-full md:w-48 h-32 object-cover rounded"
                />
              ) : (
                <div className="w-full md:w-48 h-32 bg-gray-200 flex items-center justify-center text-sm text-gray-600 rounded">
                  No Image
                </div>
              )}

              {/* Booking Info */}
              <div className="flex-1">
                <h4 className="text-lg font-bold">{booking.car?.name || "Unknown Car"}</h4>
                <p className="text-sm text-gray-500">
                  {booking.car?.brand || "N/A"} • {booking.car?.fuelType || "N/A"} • {booking.car?.transmission || "N/A"}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  <strong>Location:</strong> {booking.car?.location || "N/A"}
                </p>
                <p className="text-sm">
                  <strong>From:</strong> {new Date(booking.pickupDate).toLocaleDateString()} &nbsp;
                  <strong>To:</strong> {new Date(booking.returnDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <strong>Total Price:</strong> ₹{booking.totalPrice}
                </p>

                {/* Status Badge */}
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>

                {/* Cancel Button */}
                {booking.status === "Booked" && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
