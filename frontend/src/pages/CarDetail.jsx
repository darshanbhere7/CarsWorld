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
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { EffectCoverflow, Pagination } from 'swiper/modules';

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

  useEffect(() => {
    if (car && !isMobile) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(infoRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(specsRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.4, ease: "power2.out" });
      gsap.fromTo(bookingRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.6, ease: "power2.out" });
      gsap.fromTo(reviewsRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.8, ease: "power2.out" });
    }
  }, [car, isMobile]);

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
        <section ref={heroRef} className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start mb-8 md:mb-12">
          {/* Car Image */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            {car && car.images && car.images.length > 1 ? (
              <Swiper
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={isMobile ? 1 : 2}
                coverflowEffect={{
                  rotate: 30,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
                  slideShadows: true,
                }}
                pagination={{ clickable: true }}
                modules={[EffectCoverflow, Pagination]}
                className="w-full max-w-xs md:max-w-md rounded-2xl shadow-2xl border-4 border-blue-900"
                style={{ maxHeight: isMobile ? 220 : 340 }}
              >
                {car.images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={img}
                      alt={`${car.name} ${idx + 1}`}
                      className="w-full h-full object-cover rounded-2xl"
                      loading="lazy"
                      style={{ maxHeight: isMobile ? 220 : 340 }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : car && car.images && car.images.length === 1 ? (
              <img
                src={car.images[0]}
                alt={car.name}
                className="w-full max-w-xs md:max-w-md rounded-2xl shadow-2xl object-cover border-4 border-blue-900"
                loading="lazy"
                style={{ maxHeight: isMobile ? 220 : 340 }}
              />
            ) : null}
          </div>
          {/* Car Info */}
          <div ref={infoRef} className="w-full md:w-1/2 flex flex-col gap-4 md:gap-6">
            {car && (
              <>
                <h1 className="text-2xl md:text-4xl font-bold font-playfair tracking-wide text-white mb-2 md:mb-4 antialiased">
                  {car.name}
                </h1>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className="bg-gradient-to-r from-blue-700 to-purple-700 text-white">{car.brand}</Badge>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">{car.fuelType}</Badge>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">{car.transmission}</Badge>
                  <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">{car.location}</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-blue-200 text-base md:text-lg mb-2">
                  <span className="flex items-center gap-2"><Users className="w-5 h-5" /> {car.seats} seats</span>
                  <span className="flex items-center gap-2"><Gauge className="w-5 h-5" /> {car.mileage} kmpl</span>
                  <span className="flex items-center gap-2"><Palette className="w-5 h-5" /> {car.color}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-blue-200 font-semibold">{car.avgRating || 'N/A'}</span>
                  <span className="text-blue-300 text-sm">({car.reviewCount || 0} reviews)</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  ₹{car.pricePerDay} <span className="text-base md:text-lg text-blue-200 font-normal">/ day</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="text-blue-400 border-blue-700/60 hover:bg-blue-900/40 text-base px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={fetchCar}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    className="text-pink-400 border-pink-700/60 hover:bg-pink-900/40 text-base px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    onClick={fetchWishlist}
                  >
                    Wishlist
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
        {/* Specs Section */}
        <section ref={specsRef} className="mb-8 md:mb-12">
          <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-2xl rounded-2xl">
            <CardContent className="p-4 md:p-8 flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex-1 flex flex-col gap-2 text-blue-200 text-base md:text-lg">
                <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Model Year: {car?.modelYear}</div>
                <div className="flex items-center gap-2"><Fuel className="w-5 h-5" /> Fuel: {car?.fuelType}</div>
                <div className="flex items-center gap-2"><Settings className="w-5 h-5" /> Transmission: {car?.transmission}</div>
                <div className="flex items-center gap-2"><Gauge className="w-5 h-5" /> Mileage: {car?.mileage} kmpl</div>
                <div className="flex items-center gap-2"><Palette className="w-5 h-5" /> Color: {car?.color}</div>
                <div className="flex items-center gap-2"><Users className="w-5 h-5" /> Seats: {car?.seats}</div>
                <div className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Location: {car?.location}</div>
              </div>
              <div className="flex-1 flex flex-col gap-2 text-blue-200 text-base md:text-lg">
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> {car?.availability ? 'Available' : 'Unavailable'}</div>
                <div className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Price: ₹{car?.pricePerDay} / day</div>
                <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" /> Avg. Rating: {car?.avgRating || 'N/A'}</div>
                <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Reviews: {car?.reviewCount || 0}</div>
              </div>
            </CardContent>
          </Card>
        </section>
        {/* Booking Section */}
        <section ref={bookingRef} className="mb-8 md:mb-12">
          <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-2xl rounded-2xl">
            <CardContent className="p-4 md:p-8 flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold font-playfair tracking-wide text-white mb-2 md:mb-4 antialiased">Book this Car</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="pickup-date" className="text-blue-200">Pickup Date</Label>
                  <Input
                    id="pickup-date"
                    type="date"
                    value={pickupDate}
                    onChange={e => setPickupDate(e.target.value)}
                    className="bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg py-2 md:py-2.5"
                    aria-label="Pickup date"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="return-date" className="text-blue-200">Return Date</Label>
                  <Input
                    id="return-date"
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white border border-blue-800/60 shadow-md rounded-lg focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 text-base md:text-lg py-2 md:py-2.5"
                    aria-label="Return date"
                  />
                </div>
              </div>
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
                  disabled={!!bookingConflict || !pickupDate || !returnDate}
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
        <section ref={reviewsRef} className="mb-8 md:mb-12">
          <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-2xl rounded-2xl">
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
        </section>
      </div>
    </div>
  );
};

export default CarDetail;