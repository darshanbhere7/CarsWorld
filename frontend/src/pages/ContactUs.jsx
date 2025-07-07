import React, { useState } from "react";
import api from "../services/api";

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
    <div className="max-w-5xl mx-auto py-12 px-4 grid md:grid-cols-2 gap-10">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-200">Contact Us</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">Have questions or need help? Fill out the form and our team will get back to you soon!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded min-h-[100px] dark:bg-gray-900 dark:text-white dark:border-gray-700"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition dark:bg-blue-800 dark:hover:bg-blue-900">Send</button>
          {submitted && <p className="text-green-600 mt-2 dark:text-green-400">Thank you for your enquiry! We'll get back to you soon.</p>}
          {error && <p className="text-red-600 mt-2 dark:text-red-400">{error}</p>}
        </form>
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-2 dark:text-blue-200">Contact Information</h3>
          <p className="text-gray-700 dark:text-gray-300">📍 CarsWorld, SPIT, Andheri Mumbai</p>
          <p className="text-gray-700 dark:text-gray-300">📞 8080583088</p>
          <p className="text-gray-700 dark:text-gray-300">✉️ info@carsworld.com</p>
        </div>
      </div>
      <div className="w-full h-80 rounded-lg overflow-hidden shadow dark:bg-gray-900">
        <iframe
          title="CarsWorld Andheri Location"
          src="https://www.google.com/maps?q=SPIT+Andheri+Mumbai&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactUs; 