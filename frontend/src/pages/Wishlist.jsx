import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Trash2, 
  Car, 
  Calendar, 
  IndianRupee,
  ShoppingCart,
  Sparkles
} from "lucide-react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

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
      setRemovingId(carId);
      await api.post("/auth/wishlist/remove", { carId });
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  const SkeletonCard = () => (
    <Card className="overflow-hidden animate-pulse bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-gray-900/60 rounded-2xl shadow-2xl">
      <CardContent className="p-0">
        <div className="h-48 bg-blue-900/40 rounded-t-2xl"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-blue-900/40 rounded w-3/4"></div>
          <div className="h-3 bg-purple-900/40 rounded w-1/2"></div>
          <div className="h-4 bg-blue-900/40 rounded w-1/3"></div>
          <div className="h-8 bg-purple-900/40 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="text-center py-16 px-6">
      <div className="mb-6 relative">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-700/80 to-purple-700/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Heart className="w-12 h-12 text-pink-300" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-100" />
        </div>
      </div>
      <h3 className="text-2xl font-bold font-playfair tracking-wide text-white mb-2 antialiased">Your wishlist is empty</h3>
      <p className="text-blue-200 mb-6 max-w-md mx-auto">
        Start adding cars to your wishlist by clicking the heart icon on any car you love!
      </p>
      <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-xl">
        <Link to="/cars">
          <Car className="w-4 h-4 mr-2" />
          Browse Cars
        </Link>
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 flex flex-col items-center p-6">
        <div className="mb-8 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-pink-700 to-purple-700 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold font-playfair tracking-wide text-white antialiased">Your Wishlist</h2>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 flex flex-col items-center p-6">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .wishlist-card {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
      
      <div className="mb-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-pink-700 to-purple-700 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-playfair tracking-wide text-white antialiased">Your Wishlist</h2>
        </div>
        <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-2"></div>
        {wishlist.length > 0 && (
          <p className="text-blue-200">
            {wishlist.length} car{wishlist.length !== 1 ? 's' : ''} saved to your wishlist
          </p>
        )}
      </div>

      {wishlist.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
          {wishlist.map((car, index) => (
            <Card 
              key={car._id}
              className="wishlist-card group overflow-hidden hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 border-0 shadow-lg hover:scale-[1.02] hover:-translate-y-1 rounded-2xl animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <Link to={`/cars/${car._id}`}>
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <img 
                        src={car.image} 
                        alt={car.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>
                    </div>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-900/80 border-0 shadow-lg hover:bg-blue-800 hover:scale-110 transition-all duration-200"
                    onClick={() => handleRemove(car._id)}
                    disabled={removingId === car._id}
                  >
                    {removingId === car._id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-400" />
                    )}
                  </Button>
                </div>
                <div className="p-4">
                  <Link to={`/cars/${car._id}`} className="block">
                    <h3 className="font-bold text-lg font-playfair tracking-wide mb-2 text-white group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 antialiased">
                      {car.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-blue-900/60 text-blue-200 border-blue-700">
                        <Car className="w-3 h-3 mr-1" />
                        {car.brand}
                      </Badge>
                      <Badge variant="outline" className="border-blue-700 text-blue-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        {car.modelYear}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xl font-bold text-green-400">
                        <IndianRupee className="w-5 h-5 text-green-400" />
                        <span>{car.pricePerDay}</span>
                        <span className="text-sm text-blue-200 font-normal">/ day</span>
                      </div>
                    </div>
                  </Link>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl rounded-xl transition-all duration-200"
                    asChild
                  >
                    <Link to={`/cars/${car._id}`}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;