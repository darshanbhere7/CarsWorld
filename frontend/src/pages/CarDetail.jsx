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
import gsap from "gsap";

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

  // Animation refs
  const heroRef = useRef(null);
  const infoRef = useRef(null);
  const specsRef = useRef(null);
  const bookingRef = useRef(null);
  const reviewsRef = useRef(null);

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

  useEffect(() => {
    if (car) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(infoRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(specsRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.4, ease: "power2.out" });
      gsap.fromTo(bookingRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.6, ease: "power2.out" });
      gsap.fromTo(reviewsRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.8, ease: "power2.out" });
    }
  }, [car]);

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
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="relative overflow-hidden rounded-2xl">
                  <img 
                    src={car.image} 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card ref={heroRef} className="shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 overflow-hidden rounded-2xl">
          <div className="relative overflow-hidden rounded-t-xl group">
            <img 
              src={car.image} 
              alt={car.name} 
              className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {/* Wishlist Button */}
            {user && (
              <Button
                onClick={handleWishlist}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full w-12 h-12 transition-all duration-300 hover:scale-110 focus:scale-105"
                style={{ zIndex: 2 }}
              >
                <Heart 
                  className={`w-6 h-6 transition-colors duration-300 ${
                    wishlist.includes(car._id) 
                      ? "fill-red-500 text-red-500 drop-shadow-lg" 
                      : "text-gray-600"
                  }`} 
                />
              </Button>
            )}
          </div>
          <CardContent ref={infoRef} className="p-8">
            <div className="space-y-6">
              {/* Car Title & Basic Info */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold font-playfair tracking-wide text-white tracking-tight antialiased">
                  {car.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-gray-600">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Car className="w-4 h-4 mr-1" />
                    {car.brand}
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    {car.modelYear}
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Fuel className="w-4 h-4 mr-1" />
                    {car.fuelType}
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    {car.transmission}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold font-playfair tracking-wide text-blue-400 antialiased">
                    ₹{car.pricePerDay}
                    <span className="text-lg font-normal text-gray-500 ml-2">/ day</span>
                  </div>
                  {averageRating && (
                    <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-yellow-200 hover:to-yellow-50 group cursor-pointer" style={{ minWidth: 160 }}>
                      <div className="flex items-center">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <span className="font-bold text-blue-900 group-hover:text-purple-700 transition-colors duration-200">{averageRating}</span>
                      <span className="text-blue-700 group-hover:text-purple-700 transition-colors duration-200">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Car Specifications */}
                <div ref={specsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-4 rounded-2xl text-center shadow-lg">
                    <Settings className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-blue-200">Engine</p>
                    <p className="font-semibold text-white">{car.engine || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-4 rounded-2xl text-center shadow-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-green-400" />
                    <p className="text-sm text-blue-200">Seating</p>
                    <p className="font-semibold text-white">{car.seats || "N/A"} people</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-4 rounded-2xl text-center shadow-lg">
                    <Gauge className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm text-blue-200">Mileage</p>
                    <p className="font-semibold text-white">{car.mileage || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 p-4 rounded-2xl text-center shadow-lg">
                    <Palette className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-blue-200">Color</p>
                    <p className="font-semibold text-white">{car.color || "N/A"}</p>
                  </div>
                </div>
              {/* Location */}
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="font-medium text-white">{car.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Features */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Description */}
          {car.description && (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{car.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {car.features?.length > 0 && (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-white">Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-300"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Section */}
        <Card ref={bookingRef} className="shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl p-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-blue-400" />
              <span className="text-white">Book This Car</span>
            </CardTitle>
            <CardDescription>
              <span className="text-blue-200">Select your pickup and return dates to calculate the total price</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup" className="text-white">Pickup Date</Label>
                <Input
                  id="pickup"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 placeholder:text-blue-300 text-white bg-transparent border-blue-400"
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return" className="text-white">Return Date</Label>
                <Input
                  id="return"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 placeholder:text-blue-300 text-white bg-transparent border-blue-400"
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
            
            {/* Status Messages */}
            {checkingConflict && (
              <div className="flex items-center space-x-2 text-blue-400 bg-blue-50 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-white">Checking availability...</span>
              </div>
            )}
            
            {bookingConflict && (
              <div className="flex items-center space-x-2 bg-red-500/90 border border-red-700 shadow-lg p-3 rounded-lg animate-fade-in">
                <AlertCircle className="w-5 h-5 text-white" />
                <span className="text-white font-semibold drop-shadow-sm">{bookingConflict}</span>
              </div>
            )}
            
            {totalPrice && !bookingConflict && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-semibold">Total Price:</span>
                  <span className="text-2xl font-bold text-green-600">₹{totalPrice}</span>
                </div>
              </div>
            )}
            
            {user ? (
              <Button
                onClick={handleBooking}
                disabled={isPaying || !!bookingConflict}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 focus:ring-4 focus:ring-blue-400/40 text-white py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                style={{ boxShadow: '0 4px 24px 0 rgba(80, 63, 205, 0.25)' }}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay & Book Now
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 font-medium">Please login to book this car</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card ref={reviewsRef} className="shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl p-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-white">Ratings & Reviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    className="p-4 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl border border-blue-900/40 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
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
      </div>
    </div>
  );
};

export default CarDetail;