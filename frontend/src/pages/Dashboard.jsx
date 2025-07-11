import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { socket } from "../lib/utils";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Fuel, Settings, Car, Clock, X, CheckCircle, AlertCircle, Star, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import gsap from "gsap";

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  // Change reviewedCars to reviewedBookings (array of booking._id)
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const [activeReviewBookingId, setActiveReviewBookingId] = useState(null);

  // Animation refs
  const headerRef = useRef(null);
  const bookingsRef = useRef(null);

  // Helper to detect mobile
  const isMobile = window.innerWidth < 768;

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's reviews for completed bookings (assume backend returns bookingId in each review)
  const fetchUserReviews = async () => {
    try {
      const res = await api.get('/reviews/user');
      setReviewedBookings(res.data.map(r => r.booking));
    } catch {}
  };

  useEffect(() => {
    fetchBookings();
    fetchUserReviews();
    // Listen for real-time booking updates
    socket.on("booking_updated", fetchBookings);
    return () => {
      socket.off("booking_updated", fetchBookings);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(bookingsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
    }
  }, [isMobile]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await api.put(`/bookings/cancel/${id}`);
      setMessage("❌ Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      setMessage("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Booked":
        return {
          variant: "secondary",
          className: "bg-yellow-900/70 text-yellow-300 border-yellow-700 hover:bg-yellow-900/90",
          icon: <Clock className="w-3 h-3" />
        };
      case "Completed":
        return {
          variant: "default",
          className: "bg-green-900/70 text-green-300 border-green-700 hover:bg-green-900/90",
          icon: <CheckCircle className="w-3 h-3" />
        };
      case "Cancelled":
        return {
          variant: "destructive",
          className: "bg-red-900/70 text-red-300 border-red-700 hover:bg-red-900/90",
          icon: <X className="w-3 h-3" />
        };
      default:
        return {
          variant: "outline",
          className: "bg-gray-800/80 text-gray-300 border-gray-700",
          icon: <AlertCircle className="w-3 h-3" />
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const BookingCard = ({ booking, index }) => {
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const statusConfig = getStatusConfig(booking.status);
    const isCancelling = cancellingId === booking._id;

    // Remove animation ref and gsap for a clean, modern look

    const openReviewForm = () => {
      setActiveReviewBookingId(booking._id);
      setReviewRating(5);
      setReviewComment("");
    };
    const closeReviewForm = () => setActiveReviewBookingId(null);

    const handleReviewSubmit = async () => {
      if (!reviewRating || !reviewComment) return setMessage('Please provide a rating and comment.');
      setReviewSubmitting(true);
      try {
        await api.post('/reviews', {
          carId: booking.car._id,
          bookingId: booking._id,
          rating: reviewRating,
          comment: reviewComment
        });
        setMessage('Review submitted!');
        closeReviewForm();
        await fetchBookings();
        await fetchUserReviews();
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to submit review.');
      } finally {
        setReviewSubmitting(false);
      }
    };

    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl transition-all duration-300 w-full max-w-5xl mx-auto min-h-[200px] h-60 flex flex-row items-stretch overflow-hidden">
        <CardContent className="p-0 flex flex-row w-full h-full">
          {/* Car Image Section */}
          <div className="relative w-64 min-w-[16rem] max-w-[18rem] aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center shadow-lg m-4">
            {booking.car?.images && booking.car.images.length > 0 ? (
              <img
                src={booking.car.images[0]}
                alt={booking.car.name}
                className="object-cover w-full h-full rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-gray-900/40 flex items-center justify-center rounded-xl">
                <div className="text-center">
                  <Car className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <span className="text-sm text-blue-200">No Image</span>
                </div>
              </div>
            )}
            {/* Status Badge Overlay */}
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full flex items-center gap-1 shadow text-xs font-bold ${statusConfig.className}`}>
              {statusConfig.icon} {booking.status}
            </span>
          </div>
          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-center p-4 gap-2 md:gap-3">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              {/* Only car name on the first line */}
              <h3 className="text-2xl font-bold font-playfair tracking-wide text-white antialiased mb-1 md:mb-0">
                {booking.car?.name || "Unknown Car"}
              </h3>
            </div>
            {/* Badges row below car name */}
            <div className="flex flex-wrap gap-2 mb-1">
              <Badge className="bg-blue-700 text-white px-2 py-0.5 rounded-full font-inter text-xs font-medium">
                {booking.car?.brand || "N/A"}
              </Badge>
              <Badge className="bg-green-600 text-white px-2 py-0.5 rounded-full font-inter text-xs font-medium">
                {booking.car?.fuelType || "N/A"}
              </Badge>
              <Badge className="bg-blue-500 text-white px-2 py-0.5 rounded-full font-inter text-xs font-medium flex items-center gap-1">
                <Settings className="w-4 h-4" /> {booking.car?.transmission || "N/A"}
              </Badge>
            </div>
            <Separator className="my-1 bg-blue-900/40" />
            {/* Details Grid: remove location */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-8">
              <div className="flex flex-col gap-2 text-blue-200 text-sm font-inter">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">
                    {formatDate(booking.pickupDate)} - {formatDate(booking.returnDate)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end md:items-center md:justify-center">
                <span className="text-blue-200 text-sm">Total Price</span>
                <span className="text-2xl font-bold text-green-400 font-inter">₹{booking.totalPrice}</span>
              </div>
            </div>
            {/* Actions */}
            {booking.status === "Booked" && (
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => handleCancel(booking._id)}
                  variant="destructive"
                  size="sm"
                  disabled={isCancelling}
                  className="hover:bg-red-700 transition-colors rounded-xl px-6 py-2 font-bold"
                >
                  {isCancelling ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel Booking
                    </div>
                  )}
                </Button>
              </div>
            )}
            {booking.status === "Completed" && !reviewedBookings.includes(booking._id) && (
              <>
                <Button
                  onClick={openReviewForm}
                  variant="outline"
                  size="sm"
                  className="border-blue-400 text-blue-400 hover:bg-blue-900/30 mt-2"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Add Review
                </Button>
                <Dialog open={activeReviewBookingId === booking._id} onOpenChange={val => { if (!val) closeReviewForm(); }}>
                  <DialogContent className="max-w-lg w-full bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-gray-900/90 p-0">
                    <DialogHeader className="p-6 pb-2">
                      <DialogTitle className="flex items-center gap-2 text-lg font-bold font-playfair tracking-wide text-white">
                        <Star className="w-5 h-5 text-yellow-400" /> Add Your Review
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-2 flex flex-col gap-4">
                      <div>
                        <label className="block text-blue-200 mb-2">Rating</label>
                        <select
                          className="w-full p-2 rounded bg-gray-800 text-white"
                          value={reviewRating}
                          onChange={e => setReviewRating(Number(e.target.value))}
                        >
                          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-blue-200 mb-2">Comment</label>
                        <Textarea
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this car..."
                          className="min-h-[100px] bg-gray-800 text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button onClick={closeReviewForm} variant="outline">Cancel</Button>
                        <Button onClick={async () => { await handleReviewSubmit(); closeReviewForm(); }} disabled={reviewSubmitting} className="bg-blue-600 text-white">
                          {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {booking.status === "Completed" && reviewedBookings.includes(booking._id) && (
              <div className="pt-2 flex justify-end">
                <Badge className="bg-green-700 text-white">Reviewed</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 rounded-2xl bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-gray-900/40" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 py-10 px-2">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-full shadow-lg animate-pulse">
              <Car className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold font-playfair tracking-wide text-white antialiased animate-gradient-text">
              Welcome back, {user?.name}!
            </h1>
          </div>
          <p className="text-blue-200 ml-11">Manage your car bookings and track your reservations</p>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className="mb-6 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 text-white animate-fade-in">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Bookings Section */}
        <div ref={bookingsRef} className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-playfair tracking-wide text-white antialiased">Your Bookings</h2>
            <Badge variant="outline" className="text-xs bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 text-blue-200 border-blue-700">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </Badge>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : bookings.length === 0 ? (
            <Card className="border-dashed border-2 border-blue-900/40 bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-gray-900/60">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-full mb-4">
                  <Car className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold font-playfair tracking-wide text-white mb-2 antialiased">No bookings yet</h3>
                <p className="text-blue-200 text-center max-w-md">
                  You haven't made any car bookings yet. Start exploring our available vehicles to make your first reservation.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <BookingCard key={booking._id} booking={booking} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-top-2 {
          animation: slideInFromTop 0.3s ease-out;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;