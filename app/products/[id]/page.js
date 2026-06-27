"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import InquiryForm from "@/components/InquiryForm";

// High-quality mock inventory fallback
const MOCK_PRODUCTS = [
  {
    id: "mock-scooty-1",
    name: "HELOKOEV Aura E-Scooty",
    model: "Aura Pro 2026",
    price: 115000,
    category: "E-Scooter",
    battery: "72V 34Ah Lithium-ion (LFP)",
    range: "120 km per charge",
    topSpeed: "75 km/h",
    inStock: true,
    whatsappNumber: "+91 93346 64942",
    description: "The HELOKOEV Aura Pro is our flagship electric scooty, engineered for premium city commutes. Equipped with a smart fire-resistant LFP battery, regenerational braking, and sleek neon LED body outlines.",
    images: [
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: "mock-bike-2",
    name: "HELOKOEV Thunder Bike",
    model: "Thunder-X",
    price: 139000,
    category: "E-Bike",
    battery: "72V 40Ah High-Density Li-Ion",
    range: "150 km",
    topSpeed: "95 km/h",
    inStock: true,
    whatsappNumber: "+91 93346 64942",
    description: "A high-performance electric street bike built for enthusiasts. Thunder-X features a mid-drive motor yielding immediate torque, three custom ride modes (Eco, City, Sport), and wireless app diagnostics.",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: "mock-cycle-3",
    name: "HELOKOEV Urban E-Cycle",
    model: "Urban Lite",
    price: 28500,
    category: "E-Cycle",
    battery: "36V 7.8Ah Detachable battery",
    range: "45 km (Pedal Assist)",
    topSpeed: "25 km/h",
    inStock: true,
    whatsappNumber: "+91 93346 64942",
    description: "Perfect for active lifestyles, the Urban Lite E-Cycle combines lightweight mechanical gears with an auxiliary electric motor. Ideal for daily exercise and short-distance grocery runs.",
    images: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: "mock-rickshaw-4",
    name: "HELOKOEV Mayuri Rickshaw",
    model: "Mayuri Super Loader",
    price: 158000,
    category: "E-Rickshaw",
    battery: "48V 120Ah Lead Acid Heavy-Duty",
    range: "90 km",
    topSpeed: "25 km/h",
    inStock: true,
    whatsappNumber: "+91 93346 64942",
    description: "The ultimate passenger and cargo transport vehicle. Engineered for heavy loading, with a double-suspension front axle, digital mileage meters, and dynamic weather protection canopy.",
    images: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=60"
    ]
  }
];

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  
  // Inquiry form modal state
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        if (!params.id) {
          throw new Error("No product ID specified");
        }

        // 1. Check if it is a mock ID, resolve directly from local catalog
        if (params.id.startsWith("mock-")) {
          const mockItem = MOCK_PRODUCTS.find((p) => p.id === params.id);
          if (mockItem) {
            setProduct(mockItem);
          } else {
            setError("Product not found");
          }
          return;
        }

        // 2. Otherwise try loading from firestore
        const docRef = doc(db, "products", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Check fallback mock list if database snapshot doesn't exist
          const mockItem = MOCK_PRODUCTS.find((p) => p.id === params.id);
          if (mockItem) {
            setProduct(mockItem);
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        console.error("Firestore loading failed. Trying fallback mock resolution.", err);
        const mockItem = MOCK_PRODUCTS.find((p) => p.id === params.id);
        if (mockItem) {
          setProduct(mockItem);
        } else {
          setError("Error loading product details");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1A8C4E] mb-4" />
        <p className="text-sm font-semibold tracking-wide text-gray-500 animate-pulse">
          Loading product specifications...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6 min-h-[60vh]">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{error || "Product not found"}</h3>
        <p className="text-gray-500 text-sm mb-6">
          The requested electric vehicle could not be loaded. It may have been deleted by the admin or the ID is invalid.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#1A8C4E] hover:bg-[#15723f] text-white font-bold py-3 px-8 rounded-xl transition-all duration-200"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price || 0);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-[#1A8C4E] transition-all"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Catalog
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          {/* Active Main Image */}
          <div className="relative aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden shadow-md border border-gray-100">
            {currentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImage}
                alt={`${product.name} active thumbnail`}
                className="w-full h-full object-cover cursor-zoom-in hover:scale-101 transition-all duration-300"
                onClick={() => setIsZoomOpen(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <svg
                  className="w-16 h-16 stroke-current mb-2 opacity-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <circle cx="7" cy="15" r="2" />
                  <circle cx="17" cy="15" r="2" />
                  <path d="M12 5V15M9 8h6" />
                </svg>
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  No Image Available
                </span>
              </div>
            )}
            
            {currentImage && (
              <span className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-bold">
                🔍 Click to zoom
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 transition-all ${
                    activeImageIndex === idx
                      ? "border-[#1A8C4E] ring-2 ring-[#1A8C4E]/20"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${product.name} preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Spec sheet & Actions */}
        <div className="space-y-8">
          <div>
            <span className="inline-block bg-[#1A8C4E] text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-sm">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg font-semibold text-gray-500 mt-1">Model: {product.model}</p>
            <div className="mt-4 text-3xl sm:text-4xl font-black text-[#1A8C4E]">
              {formattedPrice}
            </div>

            {product.description && (
              <div className="mt-6 border-l-4 border-[#1A8C4E] pl-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Product Biography / Overview
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Specs Sheet Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 tracking-wide text-sm uppercase">
              Technical Specifications
            </div>
            <table className="w-full border-collapse text-left text-sm text-gray-600">
              <tbody>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50 w-1/3">Name</th>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">Model</th>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.model}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">Price</th>
                  <td className="px-6 py-4 font-extrabold text-[#1A8C4E]">{formattedPrice}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">Battery Specs</th>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.battery || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">Range</th>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.range || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">Top Speed</th>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.topSpeed || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">Category</th>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.category}</td>
                </tr>
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-800 bg-gray-50/50">Availability</th>
                  <td className="px-6 py-4 font-bold">
                    {product.inStock ? (
                      <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-md text-xs border border-green-100">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs border border-gray-200">
                        Out of Stock
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {/* WhatsApp Integration */}
            <div className="flex-1">
              <WhatsAppButton
                productName={`${product.name} (${product.model})`}
                whatsappNumber={product.whatsappNumber || "+91 93346 64942"}
              />
            </div>
            
            {/* Inquiry Form Modal Trigger */}
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow text-center flex items-center justify-center space-x-2"
            >
              ✉️ <span>Send Inquiry</span>
            </button>
          </div>
        </div>

      </div>

      {/* Gallery Zoom Modal */}
      {isZoomOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm cursor-zoom-out animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Close zoom button */}
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-150"
            aria-label="Close zoomed view"
          >
            <svg
              className="w-6 h-6"
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
          
          {/* Zoomed Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt={`${product.name} zoomed specification view`}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-300"
          />
        </div>
      )}

      {/* Inquiry Form Modal */}
      {isInquiryOpen && (
        <InquiryForm
          productId={product.id}
          productName={`${product.name} ${product.model}`}
          onClose={() => setIsInquiryOpen(false)}
        />
      )}
    </div>
  );
}
