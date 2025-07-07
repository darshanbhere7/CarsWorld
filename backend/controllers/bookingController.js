const Booking = require("../models/Booking");
const Car = require("../models/Car");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Get io instance helper
function getIO(req) {
  return req.app.get("io");
}

// ✅ Create Booking with Date Conflict Check
const createBooking = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });
    if (!car.availability) return res.status(400).json({ message: "Car is unavailable for booking" });

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    const conflict = await Booking.findOne({
      car: carId,
      status: { $in: ["Booked", "Completed"] },
      $or: [
        { pickupDate: { $lte: end }, returnDate: { $gte: start } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ message: "Car already booked for selected dates" });
    }

    const days = (end - start) / (1000 * 3600 * 24);
    if (days < 1)
      return res.status(400).json({ message: "Minimum rental period is 1 day" });

    const totalPrice = car.pricePerDay * Math.ceil(days);

    const booking = new Booking({
      user: req.user.userId,
      car: carId,
      pickupDate: start,
      returnDate: end,
      totalPrice,
    });

    await booking.save();
    // Emit car and booking update events
    const io = getIO(req);
    io.emit("car_updated", { carId: carId });
    io.emit("booking_updated", { bookingId: booking._id });
    res.status(201).json({ message: "Booking confirmed!", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get User Bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate("car")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Cancel Booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user.userId)
      return res.status(403).json({ message: "Unauthorized" });

    booking.status = "Cancelled";
    await booking.save();
    // Emit car and booking update events
    const io = getIO(req);
    io.emit("car_updated", { carId: booking.car });
    io.emit("booking_updated", { bookingId: booking._id });
    res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("car user").sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Booking Status
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status || booking.status;
    await booking.save();
    // Emit car and booking update events
    const io = getIO(req);
    io.emit("car_updated", { carId: booking.car });
    io.emit("booking_updated", { bookingId: booking._id });
    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Booking stats
const startOfDay = (date = new Date()) => new Date(date.setHours(0, 0, 0, 0));
const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfYear = (date = new Date()) => new Date(date.getFullYear(), 0, 1);

const getBookingStats = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const thisMonth = startOfMonth(new Date());
    const thisYear = startOfYear(new Date());

    const [todayEarnings, monthlyEarnings, yearlyEarnings, totalBookings, completedBookings, cancelledBookings] = await Promise.all([
      Booking.aggregate([
        { $match: { createdAt: { $gte: today }, status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: thisMonth }, status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: thisYear }, status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "Completed" }),
      Booking.countDocuments({ status: "Cancelled" }),
    ]);

    res.status(200).json({
      todayEarnings: todayEarnings[0]?.total || 0,
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      yearlyEarnings: yearlyEarnings[0]?.total || 0,
      totalBookings,
      completedBookings,
      cancelledBookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ INITIATE PAYMENT (Mocked for development)
const initiatePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    // Mock order object for development
    res.status(200).json({
      orderId: "order_" + Date.now(),
      amount: amount * 100,
      currency: "INR"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

// ✅ VERIFY PAYMENT (Mocked for development)
const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // In mock mode, skip signature verification and always succeed
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.isPaid = true;
    booking.paidAt = new Date();
    booking.paymentInfo = {
      id: "mock_payment_id",
      orderId: "mock_order_id",
      signature: "mock_signature",
    };

    await booking.save();
    res.status(200).json({ message: "Payment verified & booking updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check booking conflict for a car and date range
const checkBookingConflict = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;
    if (!carId || !pickupDate || !returnDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const conflict = await Booking.findOne({
      car: carId,
      status: { $in: ["Booked", "Completed"] },
      $or: [
        {
          pickupDate: { $lte: new Date(returnDate) },
          returnDate: { $gte: new Date(pickupDate) },
        },
      ],
    });
    if (conflict) {
      return res.status(409).json({ message: "Car already booked for selected dates" });
    }
    return res.status(200).json({ message: "No conflict" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Export All Controllers
module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingStats,
  initiatePayment,
  verifyPayment,
  checkBookingConflict,
};
