import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  Car, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!bookingData) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-playfair tracking-wide text-white antialiased">No Booking Data</CardTitle>
            <CardDescription className="text-blue-200">Please select a car to continue with booking</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate("/cars")} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl transform hover:scale-105 transition-all duration-200"
            >
              <Car className="mr-2 h-4 w-4" />
              Browse Cars
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Initiate payment (simulate)
      const initiateRes = await api.post("/bookings/payment/initiate", { amount: bookingData.totalPrice });
      const { orderId } = initiateRes.data;

      // 2. Simulate payment success (dummy)
      const paymentId = `pay_${Date.now()}`;
      const signature = "dummy_signature";

      // 3. Create booking
      const bookingRes = await api.post("/bookings", {
        carId: bookingData.carId,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
      });
      const bookingId = bookingRes.data.booking._id;

      // 4. Verify payment
      await api.post("/bookings/payment/verify", {
        bookingId,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
      });

      setStatus("success");
      toast.success("Payment successful! Booking confirmed.");
    } catch (err) {
      setStatus("failure");
      toast.error(err.response?.data?.message || "Payment or booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-700 to-purple-700 rounded-full flex items-center justify-center animate-pulse">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold font-playfair tracking-wide text-white antialiased">
            Payment
          </CardTitle>
          <CardDescription className="text-lg text-blue-200">
            Complete your car rental booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Booking Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-gray-900/60 rounded-xl shadow">
              <div className="flex items-center space-x-3">
                <Car className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-blue-200">Car</span>
              </div>
              <Badge variant="secondary" className="bg-blue-800/80 text-blue-200 border-blue-700 rounded-xl px-3 py-1">
                {bookingData.carName}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-900/60 via-emerald-900/60 to-gray-900/60 rounded-xl shadow">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-200">Pickup</span>
                </div>
                <span className="text-sm font-semibold text-green-300">
                  {new Date(bookingData.pickupDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-900/60 via-red-900/60 to-gray-900/60 rounded-xl shadow">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-200">Return</span>
                </div>
                <span className="text-sm font-semibold text-orange-300">
                  {new Date(bookingData.returnDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Total Price */}
          <div className="bg-gradient-to-br from-purple-900/60 via-pink-900/60 to-gray-900/60 p-6 rounded-xl shadow flex items-center justify-between">
            <span className="text-xl font-bold text-purple-200">Total Amount</span>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ₹{bookingData.totalPrice}
            </div>
          </div>

          {/* Payment Button */}
          {status === null && (
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay Now
                </>
              )}
            </Button>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-700 to-emerald-700 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-playfair tracking-wide text-green-300 antialiased">Payment Successful!</h3>
                <p className="text-green-200">Your booking has been confirmed</p>
              </div>
              <Button 
                onClick={() => navigate("/dashboard")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          )}

          {/* Failure State */}
          {status === "failure" && (
            <div className="text-center space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-700 to-pink-700 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-playfair tracking-wide text-red-300 antialiased">Payment Failed</h3>
                <p className="text-red-200">Please try again or contact support</p>
              </div>
              <Button 
                onClick={() => navigate("/cars")}
                variant="outline"
                className="w-full border-red-700 text-red-200 hover:bg-red-900/30 rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cars
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;