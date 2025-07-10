import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Lock, Edit3, Save, X } from "lucide-react";
import gsap from "gsap";
import { uploadToImageKit } from "../utils/uploadImage";
import { useAuth } from "../context/AuthContext";
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';

const Profile = () => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Animation refs
  const avatarRef = useRef(null);
  const profileCardRef = useRef(null);
  const passwordCardRef = useRef(null);

  const { updateUser } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  useEffect(() => {
    gsap.fromTo(avatarRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
    gsap.fromTo(profileCardRef.current, { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.1, ease: "power3.out" });
    gsap.fromTo(passwordCardRef.current, { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.3, ease: "power3.out" });
  }, [loading]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      setProfile(res.data);
      setForm({ name: res.data.name, email: res.data.email });
      setAvatar(res.data.avatar || "");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      } else if (err.response?.status === 404) {
        toast.error("Profile not found. Please log in again.");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/bookings/my/stats");
      setStats(res.data);
    } catch (err) {
      // Optionally show error
    } finally {
      setStatsLoading(false);
    }
  };

  const validateProfile = () => {
    if (!form.name) return "Name is required.";
    if (!form.email) return "Email is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Invalid email format.";
    return null;
  };

  const validatePassword = () => {
    if (!passwords.currentPassword) return "Current password is required.";
    if (!passwords.newPassword) return "New password is required.";
    if (passwords.newPassword.length < 6) return "New password must be at least 6 characters.";
    return null;
  };

  const handleProfileUpdate = async () => {
    const validationError = validateProfile();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      const res = await api.put("/auth/profile", form);
      setProfile(res.data.user);
      setEditMode(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handlePasswordChange = async () => {
    setPwLoading(true);
    const validationError = validatePassword();
    if (validationError) {
      toast.error(validationError);
      setPwLoading(false);
      return;
    }
    try {
      await api.put("/auth/change-password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadToImageKit(file);
      setAvatar(url);
      // Save avatar to backend
      const res = await api.put("/auth/profile", { ...form, avatar: url });
      setProfile(res.data.user);
      updateUser(res.data.user);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error("Failed to upload photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="text-lg text-blue-200">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 flex flex-col items-center py-10 px-2">
      {/* Avatar and Title */}
      <div className="flex flex-col items-center mb-8">
        <div ref={avatarRef} className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-700 via-purple-700 to-gray-800 flex items-center justify-center shadow-2xl mb-4 animate-float-gentle relative group overflow-hidden border-4 border-blue-400">
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-20 h-20 text-white drop-shadow-lg" />
          )}
          <button
            type="button"
            className="absolute bottom-2 right-2 bg-white border-2 border-blue-500 hover:bg-blue-600 hover:text-white text-blue-600 rounded-full p-2 shadow-lg transition-all duration-200 opacity-90 group-hover:opacity-100 z-10"
            onClick={() => fileInputRef.current.click()}
            disabled={avatarUploading}
            title="Change photo"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
            disabled={avatarUploading}
          />
          {avatarUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-20">
              <Loader2 className="w-10 h-10 text-blue-200 animate-spin" />
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold font-playfair tracking-wide animate-gradient-text text-center antialiased mb-1">Profile</h1>
        <span className="text-blue-200 text-base font-inter">Manage your account and security settings</span>
      </div>
      {/* User Stats Dashboard */}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 min-w-[220px]">
            <h2 className="text-xl md:text-2xl font-bold font-playfair tracking-wide text-white mb-4 antialiased">Your Booking Stats</h2>
            {statsLoading ? (
              <div className="text-blue-200">Loading stats...</div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{stats.totalBookings}</div>
                  <div className="text-blue-200 text-xs md:text-sm">Total Bookings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{stats.completedBookings}</div>
                  <div className="text-green-200 text-xs md:text-sm">Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400">{stats.cancelledBookings}</div>
                  <div className="text-orange-200 text-xs md:text-sm">Cancelled</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">{stats.activeBookings}</div>
                  <div className="text-purple-200 text-xs md:text-sm">Active</div>
                </div>
                <div className="col-span-2 mt-2">
                  <div className="text-lg font-bold text-yellow-300">₹{stats.totalSpent}</div>
                  <div className="text-yellow-200 text-xs md:text-sm">Total Spent</div>
                </div>
              </div>
            ) : (
              <div className="text-red-300">No stats available</div>
            )}
          </div>
          {/* Pie Chart */}
          <div className="flex-1 min-w-[220px] flex flex-col items-center">
            <h3 className="text-base font-bold font-playfair text-white mb-2">Bookings by Status</h3>
            <div className="w-full h-48">
              {stats && (
                <ResponsivePie
                  data={[
                    { id: 'Completed', label: 'Completed', value: stats.completedBookings, color: '#34d399' },
                    { id: 'Cancelled', label: 'Cancelled', value: stats.cancelledBookings, color: '#f59e42' },
                    { id: 'Active', label: 'Active', value: stats.activeBookings, color: '#a78bfa' },
                  ]}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  innerRadius={0.5}
                  padAngle={2}
                  cornerRadius={6}
                  activeOuterRadiusOffset={8}
                  colors={({ data }) => data.color}
                  borderWidth={2}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  enableArcLabels={true}
                  arcLabelsTextColor="#fff"
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#fff"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  tooltip={({ datum }) => (
                    <div style={{ color: datum.data.color, background: '#222', padding: 6, borderRadius: 4 }}>
                      <b>{datum.data.label}:</b> {datum.data.value}
                    </div>
                  )}
                  legends={[]}
                />
              )}
            </div>
          </div>
          {/* Bar Chart */}
          <div className="flex-1 min-w-[220px] flex flex-col items-center">
            <h3 className="text-base font-bold font-playfair text-white mb-2">Bookings Overview</h3>
            <div className="w-full h-48">
              {stats && (
                <ResponsiveBar
                  data={[
                    { status: 'Completed', value: stats.completedBookings, color: '#34d399' },
                    { status: 'Cancelled', value: stats.cancelledBookings, color: '#f59e42' },
                    { status: 'Active', value: stats.activeBookings, color: '#a78bfa' },
                  ]}
                  keys={['value']}
                  indexBy="status"
                  margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
                  padding={0.4}
                  colors={({ data }) => data.color}
                  borderRadius={6}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 8,
                    tickRotation: 0,
                    legend: '',
                    legendPosition: 'middle',
                    legendOffset: 32,
                  }}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 8,
                    tickRotation: 0,
                    legend: '',
                    legendPosition: 'middle',
                    legendOffset: -32,
                  }}
                  enableLabel={false}
                  tooltip={({ data }) => (
                    <div style={{ color: data.color, background: '#222', padding: 6, borderRadius: 4 }}>
                      <b>{data.status}:</b> {data.value}
                    </div>
                  )}
                  theme={{
                    axis: {
                      ticks: {
                        text: { fill: '#c7d2fe', fontSize: 12 },
                      },
                    },
                  }}
                  legends={[]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-stretch justify-center">
        {/* Profile Information Card */}
        <Card ref={profileCardRef} className="flex-1 shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl animate-fade-in min-w-0">
          <CardHeader className="bg-gradient-to-r from-blue-800/80 to-purple-800/80 text-white rounded-t-2xl">
            <CardTitle className="flex items-center space-x-2 text-2xl font-playfair tracking-wide antialiased">
              <User className="h-6 w-6 text-blue-400" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription className="text-blue-200">
              Manage your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {!editMode ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-900/60 rounded-xl shadow">
                  <User className="h-5 w-5 text-blue-400" />
                  <div>
                    <Label className="text-sm font-medium text-blue-200">Name</Label>
                    <p className="text-lg font-bold font-playfair tracking-wide text-white antialiased">{profile.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-900/60 rounded-xl shadow">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <div>
                    <Label className="text-sm font-medium text-blue-200">Email</Label>
                    <p className="text-lg font-bold font-playfair tracking-wide text-white antialiased">{profile.email}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setEditMode(true)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-400"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center space-x-2 text-blue-200">
                    <User className="h-4 w-4 text-blue-400" />
                    <span>Name</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="focus:ring-2 focus:ring-blue-500 bg-gray-900/60 text-white placeholder:text-blue-200 border-0 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center space-x-2 text-blue-200">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="focus:ring-2 focus:ring-blue-500 bg-gray-900/60 text-white placeholder:text-blue-200 border-0 rounded-xl"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    className="border-blue-700 text-blue-200 hover:bg-blue-900/40 rounded-xl"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleProfileUpdate}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-md rounded-xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-green-400"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card ref={passwordCardRef} className="flex-1 shadow-2xl border-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl animate-fade-in min-w-0">
          <CardHeader className="bg-gradient-to-r from-orange-600/80 to-purple-800/80 text-white rounded-t-2xl">
            <CardTitle className="flex items-center space-x-2 text-xl font-playfair tracking-wide antialiased">
              <Lock className="h-5 w-5 text-orange-300" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription className="text-orange-200">
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center space-x-2 text-orange-200">
                  <Lock className="h-4 w-4 text-orange-300" />
                  <span>Current Password</span>
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="focus:ring-2 focus:ring-orange-500 bg-gray-900/60 text-white placeholder:text-orange-200 border-0 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium flex items-center space-x-2 text-orange-200">
                  <Lock className="h-4 w-4 text-orange-300" />
                  <span>New Password</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="focus:ring-2 focus:ring-orange-500 bg-gray-900/60 text-white placeholder:text-orange-200 border-0 rounded-xl"
                  required
                />
                <div className="text-xs text-orange-200 mt-1">
                  Password must be at least 6 characters long
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  type="button" 
                  onClick={handlePasswordChange}
                  disabled={pwLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-md rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 focus:ring-2 focus:ring-orange-400"
                >
                  {pwLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }
        .animate-gradient-text {
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6);
          background-size: 400% 400%;
          animation: gradient-move 6s ease infinite;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Profile;