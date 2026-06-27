"use client";

import { useState } from "react";

export default function InquiryForm({ productId, productName, onClose }) {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          productId,
          productName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform scale-100 transition-all duration-300">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Send Inquiry</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Product: <span className="text-[#1A8C4E] font-bold">{productName}</span>
            </p>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-150"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-50 text-[#1A8C4E] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-9 h-9 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-extrabold text-gray-900 mb-2">
                Inquiry Sent!
              </h4>
              <p className="text-gray-600 max-w-sm mx-auto mb-8 font-medium">
                Thank you! We will contact you soon.
              </p>
              <button
                onClick={onClose}
                className="bg-[#1A8C4E] hover:bg-[#15723f] text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-md"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {apiError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-xl">
                  ⚠️ {apiError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 ${
                    errors.customerName ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
                  }`}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs font-semibold mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 99999 99999"
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 ${
                    errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs font-semibold mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 ${
                    errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-semibold mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Message <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter details about your customization requirements, bulk orders, or delivery queries..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all duration-150 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#1A8C4E] hover:bg-[#15723f] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Submit Inquiry"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
