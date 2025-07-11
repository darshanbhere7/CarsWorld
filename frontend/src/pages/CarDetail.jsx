// pages/CarDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { socket } from "../lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CalendarDays, 
  Car, 
  Star, 
  Heart, 
  MapPin, 
  Fuel, 
  Users, 
  Gauge, 
  Palette,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  MessageSquare,
  Trash2,
  Edit
} from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

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

  // Helper to detect mobile
  const isMobile = window.innerWidth < 768;

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
      fetchCar(); // <-- Add this line to update avgRating and reviewCount
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-blue-200 font-medium">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (car.availability === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.025] hover:bg-gradient-to-br hover:from-red-700/80 hover:via-pink-800/80 hover:to-indigo-900/80 hover:shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="relative overflow-hidden rounded-2xl">
                  <img 
                    src={car.images && car.images.length > 0 ? car.images[0] : ''} 
                    alt={car.name} 
                    className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold font-playfair tracking-wide text-white antialiased">{car.name}</h2>
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold text-lg">Currently Unavailable</span>
                  </div>
                  <p className="text-gray-600 max-w-md mx-auto">
                    This car is currently unavailable for booking. Please check back later or browse other cars.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col gap-8 md:gap-10 mb-10 md:mb-14">
          {/* Top Row: Image (Left) and Info (Right) */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 w-full">
            {/* Car Image (Left) */}
            <div className="w-full md:w-1/2 flex justify-center items-start">
              {/* Car image card: no hover, no color effect, no animation */}
              <Card className="w-full max-w-xl aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-2xl rounded-3xl p-2 md:p-4">
                <CardContent className="flex items-center justify-center w-full h-full p-0">
                  {car && car.images && car.images.length > 1 ? (
                    <Swiper
                      spaceBetween={16}
                      slidesPerView={1}
                      loop={true}
                      pagination={{ clickable: true, dynamicBullets: true }}
                      navigation={true}
                      effect="fade"
                      modules={[Navigation, Pagination, EffectFade]}
                      className="w-full h-full rounded-2xl"
                    >
                      {car.images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <img
                            src={img}
                            alt={`${car.name} ${idx + 1}`}
                            className="w-full h-full object-cover rounded-2xl"
                            loading="lazy"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : car && car.images && car.images.length === 1 ? (
                    <img
                      src={car.images[0]}
                      alt={car.name}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-blue-900"
                      loading="lazy"
                    />
                  ) : null}
                </CardContent>
              </Card>
            </div>
            {/* Car Info (Right) */}
            <div className="w-full md:w-1/2 flex items-start">
              <Card className="w-full bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-xl rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-800/80 hover:via-indigo-900/80 hover:to-slate-900/80 hover:border-blue-900/60">
                <CardContent className="p-0">
                  {/* Title */}
                  <h1 className="text-3xl md:text-5xl font-bold font-playfair tracking-wide text-white mb-3 antialiased text-left">
                    {car.name}
                  </h1>
                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge className="flex items-center gap-1 bg-blue-700 text-white px-2 py-0.5 rounded-full font-inter text-xs font-medium">
                      <span role="img" aria-label="brand">🚗</span> {car.brand}
                    </Badge>
                    <Badge className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-full font-inter text-xs font-medium">
                      <span role="img" aria-label="fuel">⛽</span> {car.fuelType}
                    </Badge>
                    <Badge className="flex items-center gap-1 bg-pink-500 text-white px-2 py-0.5 rounded-full font-inter text-xs font-medium">
                      <span role="img" aria-label="transmission">⚙️</span> {car.transmission}
                    </Badge>
                    <Badge className="flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded-full font-inter text-xs font-medium">
                      <span role="img" aria-label="location">📍</span> {car.location}
                    </Badge>
                  </div>
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
                    <div className="flex items-center gap-1 text-blue-200 text-sm font-inter">
                      <span role="img" aria-label="seats">🪑</span>
                      <span className="text-blue-200">Seats:</span>
                      <span className="font-bold text-white ml-1">{car.seats}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-200 text-sm font-inter">
                      <span role="img" aria-label="mileage">⛽</span>
                      <span className="text-blue-200">Mileage:</span>
                      <span className="font-bold text-white ml-1">{car.mileage} kmpl</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-200 text-sm font-inter">
                      <span role="img" aria-label="color">🎨</span>
                      <span className="text-blue-200">Color:</span>
                      <span className="font-bold text-white ml-1">{car.color}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-200 text-sm font-inter">
                      <span role="img" aria-label="model year">📅</span>
                      <span className="text-blue-200">Model Year:</span>
                      <span className="font-bold text-white ml-1">{car.modelYear}</span>
                    </div>
                  </div>
                  {/* Price, Availability, Reviews Row */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    {/* Availability Badge */}
                    <div className={`flex items-center gap-1 px-4 py-1 rounded-full font-semibold text-sm font-inter shadow min-w-[120px] justify-center ${car.availability ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}> 
                      <span role="img" aria-label="availability">{car.availability ? '✅' : '❌'}</span>
                      {car.availability ? 'Available' : 'Unavailable'}
                    </div>
                    {/* Price Badge */}
                    <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-400 text-white font-semibold text-sm shadow min-w-[120px] justify-center">
                      <span role="img" aria-label="price">💰</span>
                      <span className="font-bold">₹{car.pricePerDay}</span> <span className="text-xs font-normal text-blue-100 ml-1">/ day</span>
                    </div>
                    {/* Reviews Badge */}
                    <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-yellow-700 text-white font-semibold text-sm font-inter shadow min-w-[120px] justify-center">
                      <span role="img" aria-label="rating">⭐</span>
                      {car.avgRating || 'N/A'} <span className="text-xs font-normal text-yellow-200 ml-1">({car.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                  {/* Wishlist Button */}
                  <div className="flex justify-end mt-2">
                    {wishlist.includes(car._id) ? (
                      <Button
                        variant="outline"
                        className="text-red-500 border-red-500 hover:bg-red-100/20 text-sm px-6 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 font-bold font-inter shadow transition-all duration-200"
                        onClick={handleWishlist}
                      >
                        Remove from Wishlist
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="text-pink-500 border-pink-500 hover:bg-pink-100/20 text-sm px-6 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 font-bold font-inter shadow transition-all duration-200"
                        onClick={handleWishlist}
                      >
                        Add to Wishlist
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Below: Features and Description Cards (Full Width) */}
          <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
            {/* Description Card */}
            <Card className="flex-1 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-lg rounded-2xl p-6 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-800/80 hover:via-indigo-900/80 hover:to-slate-900/80 hover:border-blue-900/60">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-blue-100 text-xl font-bold font-playfair flex items-center gap-2 tracking-wide antialiased drop-shadow">Description</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-blue-100 text-base font-inter leading-relaxed min-h-[56px]">
                {car?.description || <span className="italic text-blue-300">No description available.</span>}
              </CardContent>
            </Card>
            {/* Features Card */}
            <Card className="flex-1 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-lg rounded-2xl p-6 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-800/80 hover:via-indigo-900/80 hover:to-slate-900/80 hover:border-blue-900/60">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-green-200 text-xl font-bold font-playfair flex items-center gap-2 tracking-wide antialiased drop-shadow">Features</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-wrap gap-2 min-h-[56px]">
                {car?.features && car.features.length > 0 ? (
                  car.features.map((feature, idx) => (
                    <Badge key={idx} className="bg-green-900/60 text-green-200 border-green-700 text-xs md:text-sm font-inter px-3 py-1 rounded-full shadow hover:bg-gradient-to-r hover:from-green-400 hover:to-emerald-500 hover:text-white transition-all duration-200">
                      {feature}
                    </Badge>
                  ))
                ) : (
                  <span className="italic text-blue-300">No features listed.</span>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        {/* Booking Section */}
        <section className="mb-8 md:mb-12">
          <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-2xl rounded-2xl transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-800/80 hover:via-indigo-900/80 hover:to-slate-900/80 hover:border-blue-900/60">
            <CardContent className="p-4 md:p-8 flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold font-playfair tracking-wide text-white mb-2 md:mb-4 antialiased">Book this Car</h2>
              {!user && (
                <div className="bg-red-100/10 border border-red-400/30 text-red-300 rounded-lg p-4 flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">You must be logged in to book a car.</span>
                  </div>
                  <Button
                    className="w-fit bg-gradient-to-r from-blue-700 to-purple-700 text-white font-bold px-6 py-2 rounded-lg mt-2"
                    onClick={() => navigate('/login')}
                  >
                    Login / Register
                  </Button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="pickup-date" className="text-blue-200">Pickup Date</Label>
                  <Input
                    id="pickup-date"
                    type="date"
                    value={pickupDate}
                    min={minDate}
                    onChange={e => setPickupDate(e.target.value)}
                    className="bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg py-2 md:py-2.5"
                    aria-label="Pickup date"
                    disabled={!user}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="return-date" className="text-blue-200">Return Date</Label>
                  <Input
                    id="return-date"
                    type="date"
                    value={returnDate}
                    min={pickupDate || minDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg py-2 md:py-2.5"
                    aria-label="Return date"
                    disabled={!user}
                  />
                </div>
              </div>
              {/* Booked Dates Warning */}
              {car.bookedDates && car.bookedDates.length > 0 && (
                <div className="text-sm text-yellow-300 mt-2">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  <span>Already booked dates: {car.bookedDates.map(d => new Date(d).toLocaleDateString()).join(', ')}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 text-blue-200 text-base md:text-lg">
                  {totalPrice ? (
                    <span>Total Price: <span className="font-bold text-white">₹{totalPrice}</span></span>
                  ) : (
                    <span>Select valid dates to see total price.</span>
                  )}
                </div>
                <Button
                  onClick={handleBooking}
                  className="bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white font-bold font-inter border-none shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 px-6 py-2 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Book now"
                  disabled={!!bookingConflict || !pickupDate || !returnDate || !user}
                >
                  Book Now
                </Button>
              </div>
              {bookingConflict && (
                <div className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {bookingConflict}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        {/* Reviews Section */}
        <section className="mb-8 md:mb-12">
          <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-2xl rounded-2xl transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-800/80 hover:via-indigo-900/80 hover:to-slate-900/80 hover:border-blue-900/60">
            <CardContent className="p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold font-playfair tracking-wide text-white mb-2 md:mb-4 antialiased">Reviews</h2>
              {/* Reviews List Only - Review form removed */}
              <Separator />
              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-blue-200">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <p className="text-white">No reviews yet. Be the first to review this car!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div 
                      key={review._id} 
                      className="p-4 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl border border-blue-900/40 transition-all duration-300 hover:bg-gradient-to-br hover:from-red-700/80 hover:via-pink-800/80 hover:to-indigo-900/80 hover:border-red-700/60"
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {review.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-white">{review.user.name}</h5>
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-blue-200 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default CarDetail;