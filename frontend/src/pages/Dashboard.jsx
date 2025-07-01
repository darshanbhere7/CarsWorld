import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/cancel/${id}`);
      setMessage("Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      setMessage("Failed to cancel booking.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name} 👋</h2>

      {message && <p className="text-blue-600 mb-4">{message}</p>}

      <h3 className="text-lg font-semibold mb-2">Your Bookings:</h3>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="border p-4 rounded bg-white shadow">
              <p><strong>Car:</strong> {booking.car.name}</p>
              <p><strong>Location:</strong> {booking.car.location}</p>
              <p><strong>From:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</p>
              <p><strong>To:</strong> {new Date(booking.returnDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className="text-blue-600">{booking.status}</span></p>
              <p><strong>Amount:</strong> ₹{booking.totalPrice}</p>

              {booking.status === "Booked" && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
