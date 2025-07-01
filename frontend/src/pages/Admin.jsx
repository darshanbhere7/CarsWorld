import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { uploadToImageKit } from "../utils/uploadImage";

const Admin = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    modelYear: "",
    fuelType: "Petrol",
    transmission: "Manual",
    location: "",
    pricePerDay: "",
    image: "",
  });
  const [message, setMessage] = useState("");

  const fetchCars = async () => {
    const res = await api.get("/cars");
    setCars(res.data);
  };

  const fetchBookings = async () => {
    const res = await api.get("/bookings/admin/all");
    setBookings(res.data);
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCars();
      fetchBookings();
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setMessage("Uploading image...");

    try {
      const imageUrl = await uploadToImageKit(form.image);

      const carData = {
        ...form,
        image: imageUrl,
        pricePerDay: Number(form.pricePerDay),
        modelYear: Number(form.modelYear),
        fuelType: capitalize(form.fuelType),
        transmission: capitalize(form.transmission),
      };

      await api.post("/cars", carData);

      setMessage("✅ Car added successfully.");
      setForm({
        name: "",
        brand: "",
        modelYear: "",
        fuelType: "Petrol",
        transmission: "Manual",
        location: "",
        pricePerDay: "",
        image: "",
      });
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding car.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/cars/${id}`);
    fetchCars();
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/bookings/admin/status/${id}`, { status });
    fetchBookings();
  };

  const capitalize = (str = "") => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  if (!user || user.role !== "admin") {
    return <p className="p-6 text-red-600">Access Denied. Admins only.</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* Add New Car */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New Car</h3>
        {message && <p className="text-blue-600 mb-2">{message}</p>}

        <form onSubmit={handleAddCar} className="grid grid-cols-2 gap-4 mt-2">
          <input name="name" placeholder="Car Name" value={form.name} onChange={handleChange} required />
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required />
          <input name="modelYear" type="number" placeholder="Model Year" value={form.modelYear} onChange={handleChange} required />

          <select name="fuelType" value={form.fuelType} onChange={handleChange} required>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select name="transmission" value={form.transmission} onChange={handleChange} required>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>

          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
          <input name="pricePerDay" type="number" placeholder="Price Per Day" value={form.pricePerDay} onChange={handleChange} required />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            required
          />

          {form.image && typeof form.image === "object" && (
            <img
              src={URL.createObjectURL(form.image)}
              alt="Preview"
              className="col-span-2 h-40 rounded object-cover"
            />
          )}

          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Car
          </button>
        </form>
      </div>

      {/* Manage Cars */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Manage Cars</h3>
        <div className="space-y-2">
          {cars.map((car) => (
            <div key={car._id} className="border p-3 flex justify-between items-center">
              <div>
                <p>{car.name} - ₹{car.pricePerDay}/day</p>
                <p className="text-sm text-gray-500">{car.location}</p>
              </div>
              <button
                className="text-red-600"
                onClick={() => handleDelete(car._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Bookings */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Manage Bookings</h3>
        <div className="space-y-2">
          {bookings.map((booking) => (
            <div key={booking._id} className="border p-3">
              <p><strong>User:</strong> {booking.user.name} ({booking.user.email})</p>
              <p><strong>Car:</strong> {booking.car.name}</p>
              <p><strong>From:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</p>
              <p><strong>To:</strong> {new Date(booking.returnDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              <select
                value={booking.status}
                onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                className="mt-1 p-2 border rounded"
              >
                <option value="Booked">Booked</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
