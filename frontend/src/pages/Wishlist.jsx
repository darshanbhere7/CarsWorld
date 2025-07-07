import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/wishlist");
      setWishlist(res.data);
    } catch (err) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (carId) => {
    try {
      await api.post("/auth/wishlist/remove", { carId });
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-600">No cars in your wishlist yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((car) => (
            <div key={car._id} className="border rounded-lg bg-white shadow p-3 flex flex-col">
              <Link to={`/cars/${car._id}`}>
                <img src={car.image} alt={car.name} className="w-full h-40 object-cover rounded mb-2" />
                <h3 className="font-bold text-lg mb-1">{car.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{car.brand} • {car.modelYear}</p>
                <p className="text-blue-600 font-semibold mb-2">₹{car.pricePerDay} / day</p>
              </Link>
              <button
                className="mt-auto bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleRemove(car._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 