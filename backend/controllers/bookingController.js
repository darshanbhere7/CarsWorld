const Booking = require("../models/Booking");
const Car = require("../models/Car");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Booking with Date Conflict Check
const createBooking = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

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

// ✅ INITIATE PAYMENT
const initiatePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: "receipt_order_" + new Date().getTime(),
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

// ✅ VERIFY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.isPaid = true;
    booking.paidAt = new Date();
    booking.paymentInfo = {
      id: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
    };

    await booking.save();
    res.status(200).json({ message: "Payment verified & booking updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
};
