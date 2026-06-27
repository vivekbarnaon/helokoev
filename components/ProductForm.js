"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const CATEGORIES = ["E-Cycle", "E-Scooter", "E-Bike", "E-Rickshaw"];

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    price: "",
    battery: "",
    range: "",
    topSpeed: "",
    category: "E-Cycle",
    whatsappNumber: "",
    description: "",
    inStock: true,
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { filename: percent }
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    setUploadProgress({});

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const storageRef = ref(storage, `products/${timestamp}_${cleanFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: Math.round(progress),
            }));
          },
          (error) => {
            console.error("Upload error: ", error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    });

    Promise.all(uploadPromises)
      .then((urls) => {
        setImages((prev) => [...prev, ...urls]);
        setUploading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to upload some images. Please try again.");
        setUploading(false);
      });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.model || !formData.price || !formData.category) {
      setError("Please fill in Name, Model, Price, and Category.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setSuccess(true);
      setFormData({
        name: "",
        model: "",
        price: "",
        battery: "",
        range: "",
        topSpeed: "",
        category: "E-Cycle",
        whatsappNumber: "",
        description: "",
        inStock: true,
      });
      setImages([]);
      setUploadProgress({});
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit product details. Check Firestore setup.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">EV Product Registration</h2>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Specify technical details, price points, and upload media thumbnails.
        </p>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-100 text-[#1A8C4E] text-sm font-semibold rounded-2xl">
              🎉 Product successfully uploaded and listed in the catalog!
            </div>
          )}

          {/* Core Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Hero Lectro"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Model Name / Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. C8i"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Price (INR ₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 45000"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Vehicle Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Battery Spec */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Battery Specification
              </label>
              <input
                type="text"
                name="battery"
                value={formData.battery}
                onChange={handleChange}
                placeholder="e.g. 36V 5.8Ah Lithium-ion"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              />
            </div>

            {/* Range */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Range (per full charge)
              </label>
              <input
                type="text"
                name="range"
                value={formData.range}
                onChange={handleChange}
                placeholder="e.g. 25-35 km"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              />
            </div>

            {/* Top Speed */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Top Speed
              </label>
              <input
                type="text"
                name="topSpeed"
                value={formData.topSpeed}
                onChange={handleChange}
                placeholder="e.g. 25 km/h"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              />
            </div>

            {/* Dealer WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Dealer WhatsApp Number
              </label>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="e.g. +91 93346 64942"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
              />
            </div>
          </div>

          {/* Description Biography */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Product Biography / Overview Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Provide a detailed description of the EV's features, unique battery capabilities, custom colors, or performance benefits..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 resize-none text-sm"
            />
          </div>

          {/* Toggle Switches / Checklist */}
          <div className="flex items-center space-x-3 py-2 bg-gray-50 px-4 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="w-5.5 h-5.5 rounded text-[#1A8C4E] focus:ring-[#1A8C4E] border-gray-300"
            />
            <label htmlFor="inStock" className="text-sm font-bold text-gray-800 cursor-pointer">
              Mark product as In Stock / Ready for Delivery
            </label>
          </div>

          {/* Media Uploader Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Product Photo Gallery <span className="text-gray-400 font-normal">(Multiple uploads allowed)</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1A8C4E]/10 file:text-[#1A8C4E] hover:file:bg-[#1A8C4E]/20 transition-all cursor-pointer"
              />
            </div>

            {/* Upload Progress Bar for each file */}
            {uploading && Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Uploading Assets:</p>
                {Object.entries(uploadProgress).map(([filename, progress]) => (
                  <div key={filename} className="text-xs">
                    <div className="flex justify-between font-semibold text-gray-700 mb-1">
                      <span className="truncate max-w-[250px]">{filename}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1A8C4E] h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Thumbnail Preview Area */}
            {images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Uploaded Images ({images.length}):</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-200 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700 transition-colors shadow"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex gap-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 py-4 bg-[#1A8C4E] hover:bg-[#15723f] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Save Product Specification"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
