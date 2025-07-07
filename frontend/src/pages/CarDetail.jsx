// pages/CarDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { socket } from "../lib/utils";

const CarDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userReview, setUserReview] = useState(null);

  const [wishlist, setWishlist] = useState([]);

  const [bookingConflict, setBookingConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  useEffect(() => {
    fetchCar();
    fetchReviews();
    if (user) fetchWishlist();
    // Listen for real-time car updates
    const handleCarUpdate = ({ carId }) => {
      if (carId === id) fetchCar();
    };
    socket.on("car_updated", handleCarUpdate);
    return () => {
      socket.off("car_updated", handleCarUpdate);
    };
  }, [id, user]);

  useEffect(() => {
    if (pickupDate && returnDate && car?.pricePerDay) {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const days = (end - start) / (1000 * 3600 * 24);
      if (days >= 1) {
        setTotalPrice(car.pricePerDay * Math.ceil(days));
      } else {
        setTotalPrice(null);
      }
    }
    setBookingConflict(null);
    if (pickupDate && returnDate && car?._id) {
      checkBookingConflict();
    }
    // eslint-disable-next-line
  }, [pickupDate, returnDate, car?._id]);

  const fetchCar = async () => {
    try {
      const res = await api.get(`/cars/${id}`);
      setCar(res.data);
    } catch (err) {
      toast.error("Failed to load car.");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);

      const existingReview = res.data.find((r) => r.user._id === user?.userId);
      if (existingReview) {
        setUserReview(existingReview);
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      }
    } catch (err) {
      toast.error("Failed to load reviews.");
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/auth/wishlist");
      setWishlist(res.data.map(car => car._id));
    } catch {}
  };

  const validateBooking = () => {
    if (!pickupDate || !returnDate) return "Select both pickup and return dates.";
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    if (start >= end) return "Return date must be after pickup date.";
    return null;
  };

  const checkBookingConflict = async () => {
    setCheckingConflict(true);
    setBookingConflict(null);
    try {
      const res = await api.post("/bookings/check-conflict", {
        carId: car._id,
        pickupDate,
        returnDate,
      });
      setBookingConflict(null);
    } catch (err) {
      setBookingConflict(err.response?.data?.message || "Conflict check failed");
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleBooking = () => {
    const validationError = validateBooking();
    if (validationError) return toast.error(validationError);
    if (bookingConflict) return toast.error(bookingConflict);
    if (!car) return;
    // Redirect to payment page with booking details
    navigate("/payment", {
      state: {
        carId: car._id,
        carName: car.name,
        pickupDate,
        returnDate,
        totalPrice,
      },
    });
  };

  const validateReview = () => {
    if (!rating || rating < 1 || rating > 5) return "Rating must be between 1 and 5.";
    if (!comment) return "Comment is required.";
    return null;
  };

  const handleReviewSubmit = async () => {
    const validationError = validateReview();
    if (validationError) return toast.error(validationError);
    try {
      await api.post("/reviews", {
        carId: id,
        rating,
        comment,
      });
      toast.success("Review submitted!");
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Review failed.");
    }
  };

  const handleDeleteReview = async () => {
    try {
      await api.delete(`/reviews/${userReview._id}`);
      toast.success("Review deleted.");
      setRating(5);
      setComment("");
      setUserReview(null);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review.");
    }
  };

  const handleWishlist = async () => {
    if (!user) return toast.info("Login to save cars to wishlist");
    if (wishlist.includes(car._id)) {
      await api.post("/auth/wishlist/remove", { carId: car._id });
      setWishlist(wishlist.filter(id => id !== car._id));
      toast.info("Removed from wishlist");
    } else {
      await api.post("/auth/wishlist/add", { carId: car._id });
      setWishlist([...wishlist, car._id]);
      toast.success("Added to wishlist");
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (!car) return <p className="p-6">Loading...</p>;
  if (car.availability === false) {
    return (
      <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow text-center">
        <img src={car.image} alt={car.name} className="w-full h-64 object-cover rounded mb-4" />
        <h2 className="text-3xl font-bold mb-2">{car.name}</h2>
        <p className="text-red-600 font-semibold text-lg mb-4">This car is currently unavailable for booking.</p>
        <p className="text-gray-600">Please check back later or browse other cars.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <img src={car.image} alt={car.name} className="w-full h-64 object-cover rounded" />
      <div className="space-y-2">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          {car.name}
          {user && (
            <button
              className="text-2xl focus:outline-none"
              onClick={handleWishlist}
              style={{ background: "rgba(255,255,255,0.8)", borderRadius: "50%", padding: 4 }}
            >
              {wishlist.includes(car._id) ? "❤️" : "🤍"}
            </button>
          )}
        </h2>
        <p className="text-gray-600">
          {car.brand} • {car.modelYear} • {car.fuelType} • {car.transmission}
        </p>
        <p className="text-lg font-semibold text-blue-600">₹{car.pricePerDay} / day</p>
        {averageRating && (
          <p className="text-yellow-600 text-sm">⭐ Average Rating: {averageRating} ({reviews.length} reviews)</p>
        )}
      </div>

      {/* Car Specs */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded">
        <p><strong>Engine:</strong> {car.engine || "N/A"}</p>
        <p><strong>Seating:</strong> {car.seats || "N/A"} people</p>
        <p><strong>Mileage:</strong> {car.mileage || "N/A"}</p>
        <p><strong>Color:</strong> {car.color || "N/A"}</p>
        <p><strong>Location:</strong> {car.location}</p>
      </div>

      {/* Description */}
      {car.description && (
        <div>
          <h4 className="font-semibold text-lg mb-1">Description:</h4>
          <p className="text-gray-700">{car.description}</p>
        </div>
      )}

      {/* Features */}
      {car.features?.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg mb-2">Features:</h4>
          <ul className="flex flex-wrap gap-2">
            {car.features.map((f, idx) => (
              <li key={idx} className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🗓️ Booking Form */}
      <div className="space-y-3 border-t pt-6">
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
        {checkingConflict && <p className="text-blue-600">Checking availability...</p>}
        {bookingConflict && <p className="text-red-600">{bookingConflict}</p>}
        {totalPrice && !bookingConflict && (
          <p className="text-green-700 font-medium">Total Price: ₹{totalPrice}</p>
        )}
        {user ? (
          <button
            onClick={handleBooking}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={isPaying || !!bookingConflict}
          >
            {isPaying ? "Processing..." : "Pay & Book Now"}
          </button>
        ) : (
          <p className="text-red-600 mt-3">Please login to book.</p>
        )}
      </div>

      {/* ⭐ Review Form */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-2">Ratings & Reviews</h3>

        {user && (
          <div className="space-y-3 mb-6">
            <label>
              Your Rating:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="block mt-1 p-2 border rounded"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 && "s"}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Comment:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="block mt-1 p-2 border rounded w-full"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReviewSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {userReview ? "Update Review" : "Submit Review"}
              </button>

              {userReview && (
                <button
                  onClick={handleDeleteReview}
                  className="text-sm text-red-500 underline"
                >
                  Delete Review
                </button>
              )}
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border rounded p-3 bg-gray-50">
                <p className="font-semibold">{r.user.name}</p>
                <p className="text-yellow-600 text-sm mb-1">⭐ {r.rating}</p>
                <p className="text-gray-700 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetail;
