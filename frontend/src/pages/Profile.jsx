import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const Profile = () => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      setProfile(res.data);
      setForm({ name: res.data.name, email: res.data.email });
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {!editMode ? (
        <div className="space-y-2 mb-6">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <button onClick={() => setEditMode(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleProfileUpdate} className="space-y-4 mb-6">
          <div>
            <label className="block mb-1">Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-2 border rounded w-full" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}
      <hr className="my-6" />
      <h3 className="text-lg font-semibold mb-2">Change Password</h3>
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block mb-1">Current Password</label>
          <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className="p-2 border rounded w-full" required />
        </div>
        <div>
          <label className="block mb-1">New Password</label>
          <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="p-2 border rounded w-full" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={pwLoading}>{pwLoading ? "Changing..." : "Change Password"}</button>
      </form>
    </div>
  );
};

export default Profile; 