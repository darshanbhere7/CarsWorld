// frontend/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { uploadToImageKit } from "../utils/uploadImage";
import { socket } from "../lib/utils";
import { addDays, format, isWithinInterval, isSameDay, parseISO } from "date-fns";

const Admin = () => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCarId, setEditCarId] = useState(null);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyLoading, setReplyLoading] = useState({});

  const [form, setForm] = useState({
    name: "",
    brand: "",
    modelYear: "",
    fuelType: "Petrol",
    transmission: "Manual",
    engine: "",
    seats: "",
    mileage: "",
    features: "",
    color: "",
    description: "",
    location: "",
    pricePerDay: "",
    image: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCars();
      fetchBookings();
      fetchStats();
      fetchUsers();
      fetchReviews();
      // Listen for real-time updates
      socket.on("car_updated", fetchCars);
      socket.on("booking_updated", () => {
        fetchBookings();
        fetchStats();
      });
      return () => {
        socket.off("car_updated", fetchCars);
        socket.off("booking_updated");
      };
    }
  }, [user]);

  const fetchCars = async () => {
    const res = await api.get("/cars/admin/all");
    setCars(res.data);
  };

  const fetchBookings = async () => {
    const res = await api.get("/bookings/admin/all");
    setBookings(res.data);
  };

  const fetchStats = async () => {
    const res = await api.get("/bookings/admin/stats");
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await api.get("/auth/users");
    setUsers(res.data);
  };

  const fetchReviews = async () => {
    const res = await api.get("/reviews");
    setReviews(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const capitalize = (str = "") =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const resetForm = () => {
    setForm({
      name: "",
      brand: "",
      modelYear: "",
      fuelType: "Petrol",
      transmission: "Manual",
      engine: "",
      seats: "",
      mileage: "",
      features: "",
      color: "",
      description: "",
      location: "",
      pricePerDay: "",
      image: "",
    });
    setIsEditing(false);
    setEditCarId(null);
    setMessage("");
  };

  const validateCar = () => {
    if (!form.name) return "Car name is required.";
    if (!form.brand) return "Brand is required.";
    if (!form.modelYear || isNaN(form.modelYear) || form.modelYear < 1900) return "Valid model year is required.";
    if (!form.location) return "Location is required.";
    if (!form.pricePerDay || isNaN(form.pricePerDay) || form.pricePerDay <= 0) return "Valid price per day is required.";
    if (!isEditing && !form.image) return "Car image is required.";
    return null;
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const validationError = validateCar();
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setMessage("Uploading image...");

    try {
      const imageUrl = await uploadToImageKit(form.image);
      const carData = {
        ...form,
        image: imageUrl,
        pricePerDay: Number(form.pricePerDay),
        modelYear: Number(form.modelYear),
        seats: Number(form.seats),
        fuelType: capitalize(form.fuelType),
        transmission: capitalize(form.transmission),
        features: form.features.split(",").map((f) => f.trim()),
      };

      await api.post("/cars", carData);
      setMessage("✅ Car added successfully.");
      resetForm();
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding car.");
    }
  };

  const handleEditCar = (car) => {
    setIsEditing(true);
    setEditCarId(car._id);
    setForm({
      ...car,
      features: car.features.join(", "),
      image: car.image, // string URL
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    const validationError = validateCar();
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setMessage("Updating car...");

    try {
      let imageUrl = form.image;
      if (typeof form.image === "object") {
        imageUrl = await uploadToImageKit(form.image);
      }

      const updatedCarData = {
        ...form,
        image: imageUrl,
        pricePerDay: Number(form.pricePerDay),
        modelYear: Number(form.modelYear),
        seats: Number(form.seats),
        fuelType: capitalize(form.fuelType),
        transmission: capitalize(form.transmission),
        features: form.features.split(",").map((f) => f.trim()),
      };

      await api.put(`/cars/${editCarId}`, updatedCarData);
      setMessage("✅ Car updated successfully.");
      resetForm();
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error updating car.");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/cars/${id}`);
    fetchCars();
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/bookings/admin/status/${id}`, { status });
    fetchBookings();
    fetchStats();
  };

  const handleBlock = async (id) => {
    await api.put(`/auth/users/${id}/block`);
    fetchUsers();
  };

  const handleUnblock = async (id) => {
    await api.put(`/auth/users/${id}/unblock`);
    fetchUsers();
  };

  const handlePromote = async (id) => {
    await api.put(`/auth/users/${id}/promote`);
    fetchUsers();
  };

  const handleDemote = async (id) => {
    await api.put(`/auth/users/${id}/demote`);
    fetchUsers();
  };

  const handleDeleteReview = async (id) => {
    await api.delete(`/reviews/${id}`);
    fetchReviews();
  };

  const handleReplyChange = (id, value) => {
    setReplyInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (id) => {
    setReplyLoading((prev) => ({ ...prev, [id]: true }));
    await api.put(`/reviews/${id}/reply`, { reply: replyInputs[id] });
    setReplyInputs((prev) => ({ ...prev, [id]: "" }));
    await fetchReviews();
    setReplyLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleSetAvailability = async (id, availability) => {
    await api.put(`/cars/${id}/availability`, { availability });
    fetchCars();
  };

  // Calendar logic
  const daysToShow = 14;
  const today = new Date();
  const days = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));

  // Helper to get bookings for a car on a specific day
  const getBookingForCarAndDay = (carId, day) => {
    return bookings.find(
      (b) =>
        b.car?._id === carId &&
        isWithinInterval(day, {
          start: parseISO(b.pickupDate),
          end: parseISO(b.returnDate),
        })
    );
  };

  if (!user || user.role !== "admin") {
    return <p className="p-6 text-red-600">Access Denied. Admins only.</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded shadow">
            <h4 className="font-semibold text-blue-800">Today's Earnings</h4>
            <p className="text-2xl font-bold text-blue-900">₹{stats.todayEarnings}</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow">
            <h4 className="font-semibold text-green-800">Monthly Earnings</h4>
            <p className="text-2xl font-bold text-green-900">₹{stats.monthlyEarnings}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded shadow">
            <h4 className="font-semibold text-yellow-800">Yearly Earnings</h4>
            <p className="text-2xl font-bold text-yellow-900">₹{stats.yearlyEarnings}</p>
          </div>
        </div>
      )}

      {/* Booking Calendar */}
      <div className="bg-white p-4 rounded shadow mb-8 overflow-x-auto">
        <h3 className="font-semibold mb-2">Booking Calendar (next 14 days)</h3>
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Car</th>
              {days.map((d, i) => (
                <th key={i} className="border p-2 bg-gray-50">{format(d, "MMM d")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id}>
                <td className="border p-2 font-semibold whitespace-nowrap">{car.name}</td>
                {days.map((day, i) => {
                  const booking = getBookingForCarAndDay(car._id, day);
                  return (
                    <td key={i} className={`border p-1 text-center ${booking ? (booking.status === "Cancelled" ? "bg-red-100" : booking.status === "Completed" ? "bg-green-100" : "bg-yellow-100") : ""}`}>
                      {booking ? (
                        <div>
                          <span className="block font-bold text-xs">{booking.user?.name || "User"}</span>
                          <span className="block text-[10px]">{booking.status}</span>
                          {isSameDay(parseISO(booking.pickupDate), day) && <span className="block text-[10px] text-blue-600">Start</span>}
                          {isSameDay(parseISO(booking.returnDate), day) && <span className="block text-[10px] text-blue-600">End</span>}
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Update Car Form */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">{isEditing ? "Update Car" : "Add New Car"}</h3>
        {message && <p className="text-blue-600 mb-2">{message}</p>}

        <form onSubmit={isEditing ? handleUpdateCar : handleAddCar} className="grid grid-cols-2 gap-4 mt-2">
          <input name="name" placeholder="Car Name" value={form.name} onChange={handleChange} required />
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required />
          <input name="modelYear" type="number" placeholder="Model Year" value={form.modelYear} onChange={handleChange} required />
          <select name="fuelType" value={form.fuelType} onChange={handleChange}>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          <select name="transmission" value={form.transmission} onChange={handleChange}>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
          <input name="engine" placeholder="Engine" value={form.engine} onChange={handleChange} />
          <input name="seats" type="number" placeholder="Seats" value={form.seats} onChange={handleChange} />
          <input name="mileage" placeholder="Mileage" value={form.mileage} onChange={handleChange} />
          <input name="color" placeholder="Color" value={form.color} onChange={handleChange} />
          <input name="features" placeholder="Features (comma separated)" value={form.features} onChange={handleChange} />
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
          <input name="pricePerDay" type="number" placeholder="Price Per Day" value={form.pricePerDay} onChange={handleChange} required />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            {...(!isEditing && { required: true })}
          />

          {form.image && typeof form.image === "object" && (
            <img src={URL.createObjectURL(form.image)} alt="Preview" className="col-span-2 h-40 object-cover rounded" />
          )}

          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? "Update Car" : "Add Car"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="col-span-2 bg-gray-400 text-white py-2 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* Car List */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Manage Cars</h3>
        <div className="space-y-2">
          {cars.map((car) => (
            <div key={car._id} className="border p-3 flex justify-between items-center">
              <div>
                <p>{car.name} - ₹{car.pricePerDay}/day</p>
                <p className="text-sm text-gray-500">{car.location}</p>
                <p className="text-xs mt-1">Status: <span className={car.availability ? "text-green-600" : "text-red-600"}>{car.availability ? "Available" : "Unavailable"}</span></p>
              </div>
              <div className="flex gap-4">
                <button className="text-blue-600" onClick={() => handleEditCar(car)}>Edit</button>
                <button className="text-red-600" onClick={() => handleDelete(car._id)}>Delete</button>
                <button
                  className={car.availability ? "bg-red-500 text-white px-3 py-1 rounded" : "bg-green-500 text-white px-3 py-1 rounded"}
                  onClick={() => handleSetAvailability(car._id, !car.availability)}
                >
                  {car.availability ? "Mark Unavailable" : "Mark Available"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Manage Bookings</h3>
        <div className="space-y-2">
          {bookings.map((booking) => (
            <div key={booking._id} className="border p-3">
              <p><strong>User:</strong> {booking.user?.name} ({booking.user?.email})</p>
              <p><strong>Car:</strong> {booking.car?.name}</p>
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

      {/* Users List */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Manage Users</h3>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p><strong>{u.name}</strong> ({u.email})</p>
                <p className="text-sm text-gray-500">Role: {u.role} | Status: {u.blocked ? "Blocked" : "Active"}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {u.blocked ? (
                  <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleUnblock(u._id)}>Unblock</button>
                ) : (
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleBlock(u._id)}>Block</button>
                )}
                {u.role === "user" ? (
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handlePromote(u._id)}>Promote to Admin</button>
                ) : (
                  <button className="bg-gray-500 text-white px-3 py-1 rounded" onClick={() => handleDemote(u._id)}>Demote to User</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Manage Reviews</h3>
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r._id} className="border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p><strong>Car:</strong> {r.car?.name || r.car}</p>
                <p><strong>User:</strong> {r.user?.name || r.user} {r.user?.email && <span className="text-xs text-gray-500">({r.user.email})</span>}</p>
                <p><strong>Rating:</strong> {r.rating} ⭐</p>
                <p><strong>Comment:</strong> {r.comment}</p>
                {r.adminReply && (
                  <p className="text-blue-700"><strong>Admin Reply:</strong> {r.adminReply}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyInputs[r._id] || ""}
                    onChange={e => handleReplyChange(r._id, e.target.value)}
                    className="p-1 border rounded"
                    style={{ minWidth: 180 }}
                  />
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleReplySubmit(r._id)}
                    disabled={!replyInputs[r._id] || replyLoading[r._id]}
                  >Reply</button>
                </div>
              </div>
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDeleteReview(r._id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
