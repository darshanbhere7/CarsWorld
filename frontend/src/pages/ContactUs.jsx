import React, { useState } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name) return "Name is required.";
    if (!form.email) return "Email is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Invalid email format.";
    if (!form.message) return "Message is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await api.post("/enquiry", form);
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to submit enquiry. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10">
        <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 text-white rounded-2xl shadow-2xl border-0">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold font-playfair tracking-wide mb-4 text-white antialiased">Contact Us</h2>
            <p className="mb-4 text-blue-200">Have questions or need help? Fill out the form and our team will get back to you soon!</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                className="bg-blue-950/60 border-blue-800 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-600 rounded-xl"
              />
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                required
                className="bg-blue-950/60 border-blue-800 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-600 rounded-xl"
              />
              <Textarea
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                required
                className="bg-blue-950/60 border-blue-800 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-600 rounded-xl min-h-[100px]"
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-xl shadow-lg">Send</Button>
              {submitted && <p className="text-green-400 mt-2">Thank you for your enquiry! We'll get back to you soon.</p>}
              {error && <p className="text-red-400 mt-2">{error}</p>}
            </form>
            <div className="mt-8">
              <h3 className="font-bold font-playfair tracking-wide text-lg mb-2 text-blue-200 antialiased">Contact Information</h3>
              <p className="text-blue-100">📍 CarsWorld, SPIT, Andheri Mumbai</p>
              <p className="text-blue-100">📞 8080583088</p>
              <p className="text-blue-100">✉️ info@carsworld.com</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl shadow-2xl border-0 flex items-center justify-center h-80">
          <CardContent className="w-full h-full p-0 rounded-2xl overflow-hidden">
            <iframe
              title="CarsWorld Andheri Location"
              src="https://www.google.com/maps?q=SPIT+Andheri+Mumbai&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '1rem' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactUs; 