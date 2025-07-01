// controllers/bookingController.js
const Booking = require("../models/Booking");
const Car = require("../models/Car");

// Book a car
const createBooking = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;
    const car = await Car.findById(carId);

    if (!car) return res.status(404).json({ message: "Car not found" });

    // calculate total days & price
    const days =
      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) /
      (1000 * 3600 * 24);

    if (days < 1)
      return res
        .status(400)
        .json({ message: "Minimum rental period is 1 day" });

    const totalPrice = car.pricePerDay * Math.ceil(days);

    const booking = new Booking({
      user: req.user.userId,
      car: carId,
      pickupDate,
      returnDate,
      totalPrice,
    });

    await booking.save();
    res.status(201).json({ message: "Car booked successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current user's bookings
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

// Cancel a booking (user)
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

// Admin: View all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("car user")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Update booking status
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

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
