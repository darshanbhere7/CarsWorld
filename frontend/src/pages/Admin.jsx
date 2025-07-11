// frontend/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { uploadToImageKit } from "../utils/uploadImage";
import { socket } from "../lib/utils";
import { addDays, format, isWithinInterval, isSameDay, parseISO } from "date-fns";
import gsap from "gsap";
import { useRef } from "react";
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
    images: [], // now array
  });
  const [imageInput, setImageInput] = useState(null); // for single file input

  const [message, setMessage] = useState("");

  // Animation refs
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const calendarRef = useRef(null);

  const [selectedCarId, setSelectedCarId] = useState("");
  const [calendarDays, setCalendarDays] = useState(15);

  // Helper to detect mobile
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!isMobile) {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
      }
      if (statsRef.current) {
        gsap.fromTo(statsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
      }
      if (calendarRef.current) {
        gsap.fromTo(calendarRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.4, ease: "power3.out" });
      }
    }
  }, [stats, cars, isMobile]);

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
      images: [],
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
    if (!isEditing && !form.images.length) return "Car image is required.";
    return null;
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const validationError = validateCar();
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setMessage("Uploading images...");

    try {
      // Upload all images and get URLs
      const imageFiles = Array.from(form.images);
      const imageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadToImageKit(file);
        imageUrls.push(url);
      }
      const carData = {
        ...form,
        images: imageUrls,
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
      images: car.images || [], // array
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
      let imageUrls = [];
      // If new files are selected, upload them, else use existing URLs
      if (form.images && form.images.length && typeof form.images[0] === "object") {
        for (const file of form.images) {
          if (typeof file === "string") imageUrls.push(file);
          else imageUrls.push(await uploadToImageKit(file));
        }
      } else {
        imageUrls = form.images;
      }
      const updatedCarData = {
        ...form,
        images: imageUrls,
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
  const today = new Date();
  const days = Array.from({ length: calendarDays }, (_, i) => addDays(today, i));

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
    return <p className="p-6 text-red-400 bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 rounded-2xl">Access Denied. Admins only.</p>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 p-0 flex justify-center items-start">
      <div className="w-full max-w-6xl mx-auto space-y-10 p-4 md:p-8">
        <h2 ref={headerRef} className="text-4xl md:text-5xl font-bold font-playfair tracking-wide text-center animate-gradient-text antialiased mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">Admin Dashboard</h2>

        {/* Stats */}
        {stats && (
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-800/80 via-purple-900/80 to-gray-900/80 p-7 rounded-3xl shadow-2xl border border-blue-600/30 flex flex-col items-center group hover:scale-105 transition-all duration-300 animate-fade-in">
              <span className="text-5xl font-bold text-blue-400 drop-shadow-lg mb-2 animate-float-gentle">₹{stats.todayEarnings}</span>
              <span className="text-base font-playfair text-blue-200 tracking-wide">Today's Earnings</span>
            </div>
            <div className="bg-gradient-to-br from-green-800/80 via-blue-900/80 to-gray-900/80 p-7 rounded-3xl shadow-2xl border border-green-600/30 flex flex-col items-center group hover:scale-105 transition-all duration-300 animate-fade-in">
              <span className="text-5xl font-bold text-green-400 drop-shadow-lg mb-2 animate-float-gentle">₹{stats.monthlyEarnings}</span>
              <span className="text-base font-playfair text-green-200 tracking-wide">Monthly Earnings</span>
            </div>
            <div className="bg-gradient-to-br from-yellow-700/80 via-purple-900/80 to-gray-900/80 p-7 rounded-3xl shadow-2xl border border-yellow-400/30 flex flex-col items-center group hover:scale-105 transition-all duration-300 animate-fade-in">
              <span className="text-5xl font-bold text-yellow-300 drop-shadow-lg mb-2 animate-float-gentle">₹{stats.yearlyEarnings}</span>
              <span className="text-base font-playfair text-yellow-200 tracking-wide">Yearly Earnings</span>
            </div>
          </div>
        )}

        {/* Booking Calendar */}
        <div ref={calendarRef} className="relative bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-8 rounded-3xl shadow-2xl mb-10 border border-blue-800/40 animate-fade-in">
          <div className="absolute inset-0 pointer-events-none rounded-3xl animate-gradient-x bg-gradient-to-r from-blue-800/20 via-purple-800/20 to-transparent" style={{zIndex:1}} />
          <h3 className="font-bold font-playfair tracking-wide mb-4 text-white z-10 relative antialiased text-2xl">Booking Calendar <span className="text-base font-inter text-blue-200">(select a car to view bookings)</span></h3>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 z-10 relative">
            <Select onValueChange={(value) => setSelectedCarId(value)} value={selectedCarId}>
              <SelectTrigger className="bg-blue-900/80 text-white rounded-xl p-2 font-inter border border-blue-700 focus:ring-2 focus:ring-blue-400 outline-none min-w-[200px]">
                <SelectValue placeholder="Select Car" />
              </SelectTrigger>
              <SelectContent>
                {cars.map(car => (
                  <SelectItem key={car._id} value={car._id}>{car.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setCalendarDays(Number(value))} value={calendarDays.toString()}>
              <SelectTrigger className="bg-blue-900/80 text-white rounded-xl p-2 font-inter border border-blue-700 focus:ring-2 focus:ring-blue-400 outline-none min-w-[120px]">
                <SelectValue placeholder="Next 15 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Next 15 days</SelectItem>
                <SelectItem value="30">Next 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedCarId ? (
            <div className="overflow-auto z-10 relative max-h-[400px] rounded-3xl border border-blue-800/40">
            <table className="min-w-full text-xs text-blue-100 font-medium rounded-2xl">
                <thead className="sticky top-0 z-30 bg-blue-900/80">
                <tr>
                    <th className="p-2 text-blue-200 font-semibold text-left bg-blue-900/90 rounded-tl-2xl z-40">Car</th>
                  {days.map((d, i) => (
                      <th key={i} className="p-2 text-blue-100 font-semibold text-center bg-blue-900/80 z-30">{format(d, "MMM d")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                  <tr className="hover:bg-blue-900/40 transition-all">
                    <td className="p-2 font-semibold whitespace-nowrap text-white bg-blue-900/80 border-r border-blue-800/40 rounded-bl-2xl z-20">
                      {cars.find(car => car._id === selectedCarId)?.name}
                    </td>
                    {days.map((day, i) => {
                      const booking = getBookingForCarAndDay(selectedCarId, day);
                      return (
                        <td key={i} className={`p-1 text-center min-w-[70px] transition-all duration-200 ${booking ? (booking.status === "Cancelled" ? "bg-red-900/60 text-red-300" : booking.status === "Completed" ? "bg-green-900/60 text-green-300" : "bg-yellow-900/60 text-yellow-200") : "hover:bg-blue-900/30"}`} style={{border: '1px solid rgba(59,130,246,0.08)'}}>
                          {booking ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="block font-bold text-xs text-white bg-gradient-to-r from-blue-700/60 to-purple-700/60 px-2 py-0.5 rounded-full shadow-sm mb-0.5">{booking.user?.name || "User"}</span>
                              <span className={`block text-[10px] font-semibold px-2 py-0.5 rounded-full ${booking.status === "Completed" ? "bg-green-900/60 text-green-300" : booking.status === "Cancelled" ? "bg-red-900/60 text-red-300" : "bg-yellow-900/60 text-yellow-200"}`}>{booking.status}</span>
                              {isSameDay(parseISO(booking.pickupDate), day) && <span className="block text-[10px] text-blue-400 font-bold">Start</span>}
                              {isSameDay(parseISO(booking.returnDate), day) && <span className="block text-[10px] text-blue-400 font-bold">End</span>}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
              </tbody>
            </table>
          </div>
          ) : (
            <div className="text-blue-300 text-center py-10 font-inter">Select a car to view its booking calendar.</div>
          )}
        </div>

        {/* Add / Update Car Form */}
        <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl animate-fade-in">
          <h3 className="font-bold font-playfair tracking-wide mb-2 text-white antialiased">{isEditing ? "Update Car" : "Add New Car"}</h3>
          {message && <p className="text-blue-400 mb-2">{message}</p>}

          <form onSubmit={isEditing ? handleUpdateCar : handleAddCar} className="grid grid-cols-2 gap-4 mt-2">
            <input name="name" placeholder="Car Name" value={form.name} onChange={handleChange} required className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="modelYear" type="number" placeholder="Model Year" value={form.modelYear} onChange={handleChange} required className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <select name="fuelType" value={form.fuelType} onChange={handleChange} className="bg-gray-900/60 text-white rounded-xl p-2">
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <select name="transmission" value={form.transmission} onChange={handleChange} className="bg-gray-900/60 text-white rounded-xl p-2">
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
            <input name="engine" placeholder="Engine" value={form.engine} onChange={handleChange} className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="seats" type="number" placeholder="Seats" value={form.seats} onChange={handleChange} className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="mileage" placeholder="Mileage" value={form.mileage} onChange={handleChange} className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="color" placeholder="Color" value={form.color} onChange={handleChange} className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="features" placeholder="Features (comma separated)" value={form.features} onChange={handleChange} className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />
            <input name="pricePerDay" type="number" placeholder="Price Per Day" value={form.pricePerDay} onChange={handleChange} required className="bg-gray-900/60 text-white placeholder:text-blue-200 rounded-xl p-2" />

            <label className="col-span-2 text-blue-200 font-medium">Car Images <span className="text-xs text-blue-400">(Add images one by one in your preferred order)</span></label>
            <div className="col-span-2 flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageInput(e.target.files[0])}
                  className="bg-gray-900/60 text-white rounded-xl p-2"
                />
                <Button
                  type="button"
                  className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-all duration-300"
                  onClick={() => {
                    if (imageInput) {
                      setForm(prev => ({ ...prev, images: [...prev.images, imageInput] }));
                      setImageInput(null);
                    }
                  }}
                  disabled={!imageInput}
                >
                  Add Image
                </Button>
              </div>
              <span className="text-xs text-blue-400 mb-2">Add images one by one. You can remove or reorder before submitting.</span>
              {/* Preview selected images with remove option */}
              {form.images && form.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={typeof img === "string" ? img : URL.createObjectURL(img)}
                        alt={`Preview ${idx + 1}`}
                        className="h-24 object-cover rounded-xl border border-blue-800/30 shadow"
                      />
                      <Button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs opacity-80 hover:opacity-100"
                        onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105">
              {isEditing ? "Update Car" : "Add Car"}
            </Button>

            {isEditing && (
              <Button type="button" onClick={resetForm} className="col-span-2 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                Cancel Edit
              </Button>
            )}
          </form>
        </div>

        {/* Car List */}
        <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl animate-fade-in">
          <h3 className="text-2xl font-bold font-playfair tracking-wide mb-4 text-white antialiased">Manage Cars</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car._id} className="relative group rounded-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 shadow-xl p-4 flex flex-col gap-2 hover:scale-[1.03] transition-all duration-300 border border-blue-800/40 animate-fade-in">
                {car.images && car.images.length > 0 && (
                  <img src={car.images[0]} alt={car.name} className="w-full h-32 object-cover rounded-xl mb-2 border border-blue-800/30 shadow" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-lg font-playfair text-white antialiased">{car.name}</span>
                    <span className="text-blue-300 font-bold text-base">₹{car.pricePerDay}/day</span>
                  </div>
                  <div className="text-sm text-blue-200 mb-1">{car.location}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${car.availability ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>{car.availability ? 'Available' : 'Unavailable'}</span>
                    <span className="text-xs text-blue-200">{car.brand} • {car.modelYear}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl font-inter text-sm shadow transition-all duration-200" onClick={() => handleEditCar(car)}>Edit</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl font-inter text-sm shadow transition-all duration-200" onClick={() => handleDelete(car._id)}>Delete</Button>
                  <Button
                    className={car.availability ? "bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-xl font-inter text-sm shadow transition-all duration-200" : "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-xl font-inter text-sm shadow transition-all duration-200"}
                    onClick={() => handleSetAvailability(car._id, !car.availability)}
                  >
                    {car.availability ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking List */}
        <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl animate-fade-in">
          <h3 className="text-2xl font-bold font-playfair tracking-wide mb-4 text-white antialiased">Manage Bookings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="relative group rounded-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 shadow-xl p-4 flex flex-col gap-2 hover:scale-[1.03] transition-all duration-300 border border-blue-800/40 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-200">{booking.user?.name}</span>
                  <span className="text-xs text-blue-400">({booking.user?.email})</span>
                </div>
                <div className="font-bold text-white mb-1">{booking.car?.name}</div>
                <div className="text-xs text-blue-200 mb-1">{new Date(booking.pickupDate).toLocaleDateString()} → {new Date(booking.returnDate).toLocaleDateString()}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${booking.status === 'Completed' ? 'bg-green-900/60 text-green-300' : booking.status === 'Cancelled' ? 'bg-red-900/60 text-red-300' : 'bg-yellow-900/60 text-yellow-200'}`}>{booking.status}</span>
                </div>
                <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking._id, value)}>
                  <SelectTrigger className="bg-gray-800 text-white rounded-xl p-2 border-0 focus:ring-2 focus:ring-blue-500 mt-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Booked">Booked</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl animate-fade-in">
          <h3 className="text-2xl font-bold font-playfair tracking-wide mb-4 text-white antialiased">Manage Users</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <div key={u._id} className="relative group rounded-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 shadow-xl p-4 flex flex-col gap-2 hover:scale-[1.03] transition-all duration-300 border border-blue-800/40 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-200 text-lg">{u.name}</span>
                  <span className="text-xs text-blue-400">({u.email})</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-yellow-900/60 text-yellow-300' : 'bg-blue-900/60 text-blue-200'}`}>{u.role}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.blocked ? 'bg-red-900/60 text-red-300' : 'bg-green-900/60 text-green-300'}`}>{u.blocked ? 'Blocked' : 'Active'}</span>
                </div>
                <div className="flex gap-2 flex-wrap mt-auto">
                  {u.blocked ? (
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-xl transition-all duration-300" onClick={() => handleUnblock(u._id)}>Unblock</Button>
                  ) : (
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl transition-all duration-300" onClick={() => handleBlock(u._id)}>Block</Button>
                  )}
                  {u.role === "user" ? (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl transition-all duration-300" onClick={() => handlePromote(u._id)}>Promote to Admin</Button>
                  ) : (
                    <Button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-xl transition-all duration-300" onClick={() => handleDemote(u._id)}>Demote to User</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-6 rounded-2xl shadow-2xl animate-fade-in">
          <h3 className="text-2xl font-bold font-playfair tracking-wide mb-4 text-white antialiased">Manage Reviews</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r._id} className="relative group rounded-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 shadow-xl p-4 flex flex-col gap-2 hover:scale-[1.03] transition-all duration-300 border border-blue-800/40 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-200">{r.user?.name || r.user}</span>
                  {r.user?.email && <span className="text-xs text-blue-400">({r.user.email})</span>}
                </div>
                <div className="font-bold text-white mb-1">{r.car?.name || r.car}</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-900/60 text-yellow-300">{r.rating} ⭐</span>
                </div>
                <div className="text-blue-200 text-xs mb-1">{r.comment}</div>
                  {r.adminReply && (
                  <div className="text-blue-400 text-xs mt-1"><strong>Admin Reply:</strong> {r.adminReply}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyInputs[r._id] || ""}
                      onChange={e => handleReplyChange(r._id, e.target.value)}
                    className="p-1 rounded-xl bg-gray-800 text-white border-0 focus:ring-2 focus:ring-blue-500 min-w-[120px] flex-1"
                    />
                  <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl transition-all duration-300"
                      onClick={() => handleReplySubmit(r._id)}
                      disabled={!replyInputs[r._id] || replyLoading[r._id]}
                  >Reply</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl transition-all duration-300" onClick={() => handleDeleteReview(r._id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .animate-gradient-text {
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6);
          background-size: 400% 400%;
          animation: gradient-move 6s ease infinite;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Admin;
