// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

// Make io accessible in controllers
app.set("io", io);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/imagekit", require("./routes/imagekitRoutes")); // ✅ Corrected here
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/enquiry", require("./routes/enquiryRoutes"));
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚗 Server running on port ${PORT}`));
