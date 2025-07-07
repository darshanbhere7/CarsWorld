import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!bookingData) {
    return <div className="p-6">No booking data. <button className="text-blue-600 underline" onClick={() => navigate("/cars")}>Go to Cars</button></div>;
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
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>
      <div className="mb-4">
        <p><strong>Car:</strong> {bookingData.carName}</p>
        <p><strong>Pickup:</strong> {new Date(bookingData.pickupDate).toLocaleDateString()}</p>
        <p><strong>Return:</strong> {new Date(bookingData.returnDate).toLocaleDateString()}</p>
        <p><strong>Total Price:</strong> ₹{bookingData.totalPrice}</p>
      </div>
      {status === null && (
        <button onClick={handlePayment} className="bg-green-600 text-white px-6 py-2 rounded" disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      )}
      {status === "success" && (
        <div className="mt-6">
          <p className="text-green-700 font-semibold mb-4">Payment successful! Your booking is confirmed.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
        </div>
      )}
      {status === "failure" && (
        <div className="mt-6">
          <p className="text-red-600 font-semibold mb-4">Payment or booking failed. Please try again.</p>
          <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => navigate("/cars")}>Back to Cars</button>
        </div>
      )}
    </div>
  );
};

export default Payment; 