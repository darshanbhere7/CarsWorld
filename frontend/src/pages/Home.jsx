import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Car, 
  Shield, 
  Clock, 
  DollarSign, 
  Star, 
  Zap, 
  Users, 
  Award,
  ArrowRight,
  Calendar,
  MapPin,
  Fuel,
  Users as UsersIcon,
  Sparkles,
  CheckCircle,
  Phone,
  Mail,
  MapPinIcon,
  Play,
  Eye
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const testimonials = [
  {
    name: "Amit Singh",
    role: "Business Owner",
    text: "Booking a car was super easy and the service was excellent! The BMW I rented was in perfect condition.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7244b81?w=40&h=40&fit=crop&crop=face"
  },
  {
    name: "Priya Kumari",
    role: "Travel Blogger",
    text: "Wide range of cars and very affordable prices. The support team was available 24/7 and very helpful!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790718462-93d67d563a8c?w=40&h=40&fit=crop&crop=face"
  },
  {
    name: "Rahul Desai",
    role: "Software Engineer",
    text: "I loved the seamless experience. The mobile app is intuitive and booking takes just 30 seconds!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  },
];

const features = [
  {
    icon: Clock,
    title: "24/7 Customer Support",
    description: "Round-the-clock assistance for any queries or emergencies during your rental period.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: DollarSign,
    title: "Best Price Guarantee",
    description: "Competitive pricing with no hidden fees. Get the best value for your money.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Shield,
    title: "Fully Insured Vehicles",
    description: "All vehicles are comprehensively insured for your peace of mind.",
    color: "from-purple-500 to-violet-500"
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book your car in under 30 seconds with our streamlined booking process.",
    color: "from-orange-500 to-red-500"
  }
];

const stats = [
  { number: "50,000+", label: "Happy Customers", icon: Users },
  { number: "1,000+", label: "Cars Available", icon: Car },
  { number: "50+", label: "Cities Covered", icon: MapPinIcon },
  { number: "24/7", label: "Support Available", icon: Phone }
];

function Car3DViewer() {
  const { scene } = useGLTF('/car.glb');
  return <primitive object={scene} scale={3.2} position={[-1.3, -1.2, 0]} />;
}

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuredRef = useRef(null);
  const carRef = useRef(null);
  const carShadowRef = useRef(null);
  const car1Ref = useRef(null);
  const carCanvasRef = useRef(null); // Add this ref for the Canvas container

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const res = await api.get("/cars");
        setFeaturedCars(res.data.slice(0, 6));
      } catch (err) {
        console.error("Error fetching cars:", err);
        setFeaturedCars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedCars();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 3); // Changed to 3 as per new_code
    }, 2000); // Faster: 2 seconds
    return () => clearInterval(interval);
  }, []); // Removed heroImages.length from dependency array

  // Mock data for when API is not available
  const mockCars = [
    {
      _id: "1",
      name: "BMW X5",
      brand: "BMW",
      pricePerDay: 5000,
      images: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?w=400&h=250&fit=crop"
      ],
      fuelType: "Petrol",
      seats: 5,
      location: "Mumbai"
    },
    {
      _id: "2",
      name: "Mercedes C-Class",
      brand: "Mercedes",
      pricePerDay: 4500,
      images: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=250&fit=crop"
      ],
      fuelType: "Diesel",
      seats: 5,
      location: "Delhi"
    },
    {
      _id: "3",
      name: "Audi A4",
      brand: "Audi",
      pricePerDay: 4000,
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=250&fit=crop"
      ],
      fuelType: "Petrol",
      seats: 5,
      location: "Bangalore"
    },
    {
      _id: "4",
      name: "Toyota Camry",
      brand: "Toyota",
      pricePerDay: 3000,
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=250&fit=crop"
      ],
      fuelType: "Hybrid",
      seats: 5,
      location: "Chennai"
    },
    {
      _id: "5",
      name: "Honda City",
      brand: "Honda",
      pricePerDay: 2000,
      images: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop"
      ],
      fuelType: "Petrol",
      seats: 5,
      location: "Pune"
    },
    {
      _id: "6",
      name: "Maruti Swift",
      brand: "Maruti",
      pricePerDay: 1500,
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop"
      ],
      fuelType: "Petrol",
      seats: 5,
      location: "Hyderabad"
    }
  ];

  const displayCars = useMemo(() => (featuredCars.length > 0 ? featuredCars : mockCars), [featuredCars]);

  // Helper to detect mobile
  const isMobile = window.innerWidth < 768;

  // Reduce GSAP animation on mobile
  useLayoutEffect(() => {
    if (isMobile) return; // Skip heavy animations on mobile
    // Set initial state for all animated elements
    if (featuredRef.current) {
      gsap.set(featuredRef.current, { opacity: 0, y: 60 });
      gsap.set(featuredRef.current.querySelectorAll('.car-card'), { opacity: 0, y: 60 });
    }
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      gsap.set(featuresSection, { opacity: 0, y: 60 });
      gsap.set(featuresSection.querySelectorAll('.feature-card'), { opacity: 0, y: 60 });
    }
    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
      gsap.set(testimonialsSection, { opacity: 0, y: 60 });
      gsap.set(testimonialsSection.querySelectorAll('.testimonial-card'), { opacity: 0, y: 60 });
    }
    const ctaSection = document.getElementById('cta-section');
    if (ctaSection) {
      gsap.set(ctaSection, { opacity: 0, y: 60 });
    }

    // Animate hero section
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 40, willChange: 'opacity, transform' },
        { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: "power2.out", delay: 0.2, clearProps: 'willChange', immediateRender: false, overwrite: 'auto' }
      );
    }
    // Animate stats
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, scale: 0.92, willChange: 'opacity, transform' },
        { opacity: 1, scale: 1, stagger: 0.08, duration: 0.6, ease: "back.out(1.5)", delay: 0.6, clearProps: 'willChange', immediateRender: false, overwrite: 'auto' }
      );
    }

    // Animate all main sections after hero on page load (not on scroll)
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.7 } });
    if (featuredRef.current) {
      tl.to(featuredRef.current, { opacity: 1, y: 0 }, "+=0.2");
      tl.to(featuredRef.current.querySelectorAll('.car-card'), { opacity: 1, y: 0, stagger: 0.08 }, "-=0.4");
    }
    if (featuresSection) {
      tl.to(featuresSection, { opacity: 1, y: 0 }, "+=0.1");
      tl.to(featuresSection.querySelectorAll('.feature-card'), { opacity: 1, y: 0, stagger: 0.08 }, "-=0.4");
    }
    if (testimonialsSection) {
      tl.to(testimonialsSection, { opacity: 1, y: 0 }, "+=0.1");
      tl.to(testimonialsSection.querySelectorAll('.testimonial-card'), { opacity: 1, y: 0, stagger: 0.12 }, "-=0.4");
    }
    if (ctaSection) {
      tl.to(ctaSection, { opacity: 1, y: 0 }, "+=0.1");
    }

    // Clean up on unmount
    return () => {
      gsap.killTweensOf([featuredRef.current, featuresSection, testimonialsSection, ctaSection]);
      gsap.globalTimeline.clear();
      gsap.killTweensOf(carCanvasRef.current);
    };
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 relative overflow-x-hidden scrollbar-hide">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full animate-gradient-move bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900 via-purple-900 to-pink-900 opacity-60" />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-2xl opacity-30 animate-float"
            style={{
              width: `${40 + Math.random() * 60}px`,
              height: `${40 + Math.random() * 60}px`,
              top: `${10 + Math.random() * 70}%`,
              left: `${5 + Math.random() * 90}%`,
              background: `linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)`,
              animationDelay: `${i * 0.7}s`,
              zIndex: 1
            }}
          />
        ))}
      </div>
      {/* Hero Section with 3D Car */}
      <section className="relative min-h-[70vh] flex flex-col md:flex-row items-center md:items-stretch justify-center overflow-hidden pt-0 mt-0 gap-4" style={{zIndex: 2, paddingTop: '2.5rem'}}>
        {/* Hero Content (left on desktop) */}
        <div className="relative z-20 w-full md:w-1/2 max-w-2xl mx-auto px-4 md:ml-16 flex flex-col items-start justify-center gap-6 animate-fade-in-up text-left">
          <Badge className="mb-2 bg-gradient-to-r from-blue-700 to-purple-700 text-white border-none shadow-lg px-4 py-2 text-base font-medium">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
            India's Premier Car Rental Service
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-playfair tracking-tight text-white leading-tight antialiased mb-2">
            Rent Your <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent inline">Dream Car</span> Today
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mb-4">
            Experience luxury and convenience with our premium car rental service. From budget-friendly options to luxury vehicles, we have it all.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-start items-center mb-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold font-inter border-none shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
              <Link to="/cars" className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Browse Cars
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            {!user && (
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold font-inter border-none shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                <Link to="/login" className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
            )}
          </div>
          {/* Stats Row */}
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mt-2">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-white/70 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 3D Car Viewer (right on desktop) */}
        <div ref={carCanvasRef} className="relative w-full md:w-[60%] flex flex-col items-center justify-center z-10" style={{height: '500px', minHeight: 320}}>
          <Canvas camera={{ position: [2.5, 1.2, 3.5], fov: 45 }} style={{ width: '100%', height: '100%' }} shadows>
            <ambientLight intensity={0.7} />
            <Stage environment="city" intensity={0.6} shadows="contact">
              <Car3DViewer />
            </Stage>
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} />
          </Canvas>
        </div>
      </section>
      {/* Car Slider Below 3D Viewer
      <div className="w-full max-w-3xl mx-auto mt-4 z-20 relative">
        <Swiper spaceBetween={24} slidesPerView={1} loop={true} className="rounded-xl shadow-xl">
          <SwiperSlide>
            <img src="/src/assets/realcar.png" alt="Car 1" className="w-full h-48 object-contain bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="/src/assets/realcar2.png" alt="Car 2" className="w-full h-48 object-contain bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="/src/assets/realcar3.png" alt="Car 3" className="w-full h-48 object-contain bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl" />
          </SwiperSlide>
        </Swiper>
      </div> */}
      {/* Featured Cars Section - remove extra gap, add ref for GSAP */}
      <section ref={featuredRef} className="py-10 md:py-20 px-2 sm:px-4 -mt-8" id="featured-cars">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="section-header text-center mb-10 md:mb-16 transition-all duration-1000 transform translate-y-0 opacity-100">
            <Badge className="mb-4 bg-gradient-to-r from-blue-700 to-purple-700 text-white border-none shadow-lg">
              Featured Collection
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-playfair tracking-wide text-white mb-4 md:mb-6 drop-shadow-lg antialiased">
              Our Premium Fleet
            </h2>
            <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto">
              Discover our carefully curated selection of premium vehicles, from economy to luxury cars.
            </p>
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {loading ? (
              [...Array(6)].map((_, index) => (
                <Card key={index} className="car-card animate-pulse border-0 shadow-2xl bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-gray-900/60 backdrop-blur-md rounded-2xl">
                  <CardContent className="p-0">
                    <div className="h-48 bg-blue-950/40 rounded-t-2xl"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-blue-950/30 rounded"></div>
                      <div className="h-4 bg-blue-950/30 rounded w-2/3"></div>
                      <div className="h-8 bg-blue-950/30 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : displayCars.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Car className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-200">No featured cars available right now.</p>
              </div>
            ) : (
              displayCars.map((car, index) => (
                <Card key={car._id || index} className="car-card group hover:shadow-2xl transition-all duration-500 border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-md rounded-2xl hover:scale-105 hover:bg-gradient-to-tr hover:from-blue-800 hover:to-purple-800">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <Link to={`/cars/${car._id}`} tabIndex={0} aria-label={`View details for ${car.name}`}> {/* Make image clickable */}
                        {car.images && car.images.length > 1 ? (
                          <Swiper
                            spaceBetween={0}
                            slidesPerView={1}
                            loop={true}
                            pagination={{ clickable: true, dynamicBullets: true }}
                            navigation={true}
                            effect="fade"
                            modules={[Navigation, Pagination, EffectFade]}
                            className="w-full h-64 rounded-t-2xl"
                          >
                            {car.images.map((img, idx) => (
                              <SwiperSlide key={idx}>
                                <img
                                  src={img}
                                  alt={`${car.name} image ${idx + 1}`}
                                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                                  loading="lazy"
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        ) : (
                          <img
                            src={car.images && car.images.length > 0 ? car.images[0] : ''}
                            alt={car.name}
                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                      </Link>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 text-white backdrop-blur-sm animate-pulse shadow-md">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="sm" variant="outline" className="bg-white/90 text-gray-800 hover:bg-white">
                          <Eye className="w-4 h-4 mr-2" />
                          Quick View
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg md:text-xl font-bold font-playfair tracking-wide text-white group-hover:text-blue-400 transition-colors antialiased">
                            {car.name}
                          </h3>
                          <p className="text-blue-200 font-medium">{car.brand}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ₹{car.pricePerDay}
                          </div>
                          <div className="text-sm text-blue-300">per day</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-blue-300 mb-6 gap-2 sm:gap-0">
                        <div className="flex items-center">
                          <Fuel className="w-4 h-4 mr-1 text-green-400" />
                          {car.fuelType || 'Petrol'}
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="w-4 h-4 mr-1 text-blue-400" />
                          {car.seats || 5} seats
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-red-400" />
                          {car.location || 'Mumbai'}
                        </div>
                      </div>
                      <Button asChild className="w-full group/btn bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white shadow-lg transition-all duration-300">
                        <Link to={`/cars/${car._id}`}>
                          Book Now
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* View All Cars Button */}
          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 text-white border-blue-700/60 shadow-lg hover:bg-blue-900/90 hover:text-blue-200 transition-all duration-300 transform hover:scale-105">
              <Link to="/cars" className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                View All Cars
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-20 px-2 sm:px-4 bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900/80 backdrop-blur-md" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="section-header text-center mb-10 md:mb-16 transition-all duration-1000 transform translate-y-0 opacity-100">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none shadow-lg">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-playfair tracking-wide text-white mb-4 md:mb-6 drop-shadow-lg antialiased">
              Experience the Difference
            </h2>
            <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto">
              We provide more than just car rental. We offer a complete mobility solution with premium service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card text-center group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-md rounded-2xl hover:scale-105 hover:bg-gradient-to-tr hover:from-blue-800 hover:to-purple-800">
                <CardContent className="p-6 md:p-8">
                  <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-playfair tracking-wide text-white mb-2 md:mb-3 group-hover:text-blue-400 transition-colors antialiased">
                    {feature.title}
                  </h3>
                  <p className="text-blue-200 leading-relaxed text-base md:text-lg">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-10 md:py-20 px-2 sm:px-4" id="testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="section-header text-center mb-10 md:mb-16 transition-all duration-1000 transform translate-y-0 opacity-100">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-playfair tracking-wide text-white mb-4 md:mb-6 drop-shadow-lg antialiased">
              What Our Customers Say
            </h2>
            <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial-card border-0 shadow-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-md rounded-2xl hover:scale-105 hover:bg-gradient-to-tr hover:from-purple-800 hover:to-pink-800">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center mb-4 md:mb-6">
                    {renderStars(testimonial.rating)}
                  </div>
                  <blockquote className="text-blue-200 mb-4 md:mb-6 italic text-base md:text-lg leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 md:w-14 md:h-14 mr-3 md:mr-4 ring-2 ring-blue-500/20">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-white text-base md:text-lg">{testimonial.name}</div>
                      <div className="text-blue-300 text-sm md:text-base">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="py-10 md:py-20 px-2 sm:px-4 bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 relative overflow-hidden animate-fade-in-up">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in-delay">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair tracking-wide text-white mb-6 inline-block relative antialiased">
            Ready to Hit the Road?
            <span className="block h-1 w-2/3 mx-auto mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full animate-pulse" />
          </h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto animate-fade-in-up">
            Join thousands of satisfied customers and experience the best car rental service in India.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold font-inter border-none shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                <Link to="/register" className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Create Account
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-blue-700 font-bold font-inter hover:bg-blue-50 border border-blue-200 shadow-lg transition-all duration-300 transform hover:scale-105">
                <Link to="/login" className="flex items-center">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="lg" className="bg-white text-blue-600 font-bold font-inter hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              <Link to="/cars" className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Browse Our Cars
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;