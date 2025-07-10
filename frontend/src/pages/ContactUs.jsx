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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 flex flex-col items-center py-6 sm:py-12 px-2 sm:px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 text-white rounded-2xl shadow-2xl border-0">
          <CardContent className="p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-wide mb-3 sm:mb-4 text-white antialiased">Contact Us</h2>
            <p className="mb-3 sm:mb-4 text-blue-200 text-sm sm:text-base">Have questions or need help? Fill out the form and our team will get back to you soon!</p>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                aria-label="Your name"
                className="bg-blue-950/60 border-blue-800 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-600 rounded-xl text-base sm:text-lg"
              />
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                required
                aria-label="Your email"
                className="bg-blue-950/60 border-blue-800 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-600 rounded-xl text-base sm:text-lg"
              />
              <Textarea
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                required
                aria-label="Your message"
                className="bg-blue-950/60 border-blue-800 text-white placeholder:text-blue-300 focus:ring-2 focus:ring-blue-600 rounded-xl min-h-[80px] sm:min-h-[100px] text-base sm:text-lg"
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-xl shadow-lg text-base sm:text-lg" aria-label="Send">Send</Button>
              {submitted && <p className="text-green-400 mt-2 text-sm sm:text-base">Thank you for your enquiry! We'll get back to you soon.</p>}
              {error && <p className="text-red-400 mt-2 text-sm sm:text-base">{error}</p>}
            </form>
            <div className="mt-6 sm:mt-8">
              <h3 className="font-bold font-playfair tracking-wide text-base sm:text-lg mb-2 text-blue-200 antialiased">Contact Information</h3>
              <p className="text-blue-100 text-sm sm:text-base">📍 CarsWorld, SPIT, Andheri Mumbai</p>
              <p className="text-blue-100 text-sm sm:text-base">📞 8080583088</p>
              <p className="text-blue-100 text-sm sm:text-base">✉️ info@carsworld.com</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 rounded-2xl shadow-2xl border-0 flex items-center justify-center h-56 sm:h-80">
          <CardContent className="w-full h-full p-0 rounded-2xl overflow-hidden">
            <iframe
              title="CarsWorld Andheri Location"
              src="https://www.google.com/maps?q=SPIT+Andheri+Mumbai&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '1rem', minHeight: '180px' }}
              allowFullScreen=""
              loading="lazy"
              aria-label="Google map location"
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactUs; 