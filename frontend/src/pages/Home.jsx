import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const testimonials = [
  {
    name: "Amit S.",
    text: "Booking a car was super easy and the service was excellent! Highly recommend CarsWorld.",
  },
  {
    name: "Priya K.",
    text: "Wide range of cars and very affordable prices. The support team was very helpful!",
  },
  {
    name: "Rahul D.",
    text: "I loved the seamless experience. Will definitely use CarsWorld again!",
  },
];

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const res = await api.get("/cars");
        // Pick 3 random or top cars (here: first 3 available)
        setFeaturedCars(res.data.slice(0, 3));
      } catch (err) {
        setFeaturedCars([]);
      }
    };
    fetchFeaturedCars();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center text-center px-6 py-16 bg-blue-700 text-white dark:bg-gray-800 dark:text-blue-100 transition-colors duration-300">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to CarsWorld 🚗</h1>
        <p className="mb-6 text-lg max-w-2xl mx-auto">
          Rent your favorite car today with our seamless booking experience. Affordable, reliable, and fast!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/cars"
            className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition dark:bg-gray-900 dark:text-blue-200 dark:hover:bg-gray-700"
          >
            Browse Cars
          </Link>
          {!user && (
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 border border-white text-white rounded-lg hover:bg-blue-800 transition dark:bg-blue-900 dark:border-blue-300 dark:hover:bg-blue-800"
            >
              Login
            </Link>
          )}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center dark:text-blue-200">Featured Cars</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {featuredCars.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No featured cars available right now.</p>
          ) : (
            featuredCars.map((car, idx) => (
              <div key={car._id || idx} className="bg-white rounded-lg shadow p-4 w-60 flex flex-col items-center dark:bg-gray-900 dark:shadow-lg">
                <img src={car.image || "https://via.placeholder.com/200x120?text=Car"} alt={car.name} className="w-full h-32 object-cover rounded mb-3" />
                <h4 className="font-semibold text-lg dark:text-blue-100">{car.name}</h4>
                <p className="text-gray-600 text-sm dark:text-gray-300">{car.brand}</p>
                <p className="text-blue-700 font-bold mt-2 dark:text-blue-300">₹{car.pricePerDay} / day</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center dark:text-blue-200">Why Choose CarsWorld?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex-1 dark:bg-gray-900 dark:shadow-lg">
            <h3 className="font-semibold text-lg mb-2 dark:text-blue-100">24/7 Customer Support</h3>
            <p className="text-gray-600 dark:text-gray-300">We are always here to help you, anytime, anywhere.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex-1 dark:bg-gray-900 dark:shadow-lg">
            <h3 className="font-semibold text-lg mb-2 dark:text-blue-100">Best Price Guarantee</h3>
            <p className="text-gray-600 dark:text-gray-300">Get the best deals and offers on every booking.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex-1 dark:bg-gray-900 dark:shadow-lg">
            <h3 className="font-semibold text-lg mb-2 dark:text-blue-100">Fully Insured Cars</h3>
            <p className="text-gray-600 dark:text-gray-300">Drive with peace of mind with our insured vehicles.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center dark:text-blue-200">What Our Customers Say</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 flex-1 dark:bg-gray-900 dark:shadow-lg">
              <p className="text-gray-700 italic mb-4 dark:text-gray-200">"{t.text}"</p>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">- {t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 px-4 flex flex-col items-center bg-blue-600 text-white dark:bg-gray-800 dark:text-blue-100">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="mb-6">Sign up or log in to see all cars and book your ride!</p>
        <div className="flex gap-4">
          {!user && (
            <>
              <Link
                to="/register"
                className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition dark:bg-gray-900 dark:text-blue-200 dark:hover:bg-gray-700"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-blue-700 border border-white text-white rounded-lg hover:bg-blue-800 transition dark:bg-blue-900 dark:border-blue-300 dark:hover:bg-blue-800"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
