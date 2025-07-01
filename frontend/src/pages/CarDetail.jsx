import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CarDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/cars/${id}`);
        setCar(res.data);
      } catch (err) {
        console.error("Failed to load car", err.message);
      }
    };
    fetchCar();
  }, [id]);

  const handleBooking = async () => {
    if (!pickupDate || !returnDate) {
      setMessage("Please select pickup and return dates.");
      return;
    }

    try {
      const res = await api.post("/bookings", {
        carId: car._id,
        pickupDate,
        returnDate,
      });
      setMessage("Booking successful!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  if (!car) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <img src={car.image} alt={car.name} className="w-full h-64 object-cover mb-4 rounded" />
      <h2 className="text-2xl font-bold">{car.name}</h2>
      <p className="text-gray-600">
        {car.brand} • {car.fuelType} • {car.transmission}
      </p>
      <p className="text-lg font-semibold mt-2 text-blue-600">
        ₹{car.pricePerDay} / day
      </p>

      <div className="mt-6 space-y-3">
        <label className="block">
          Pickup Date:
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="block mt-1 p-2 border rounded w-full"
          />
        </label>
        <label className="block">
          Return Date:
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="block mt-1 p-2 border rounded w-full"
          />
        </label>

        {user ? (
          <button
            onClick={handleBooking}
            className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Book Now
          </button>
        ) : (
          <p className="text-red-600 mt-3">Please login to book.</p>
        )}

        {message && <p className="text-blue-700 mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default CarDetail;
