"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ProductCard({
  id,
  name,
  model,
  price,
  range,
  battery,
  category,
  images = [],
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Format price to Indian Rupee (₹XX,XXX)
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

  // Determine thumbnail image
  const thumbnail = images && images.length > 0 ? images[0] : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
      {/* Admin Mode Tag - Top Left */}
      {isAdmin && (
        <span className="absolute top-3 left-3 z-10 bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow flex items-center gap-1">
          <span>⚙️</span> Admin View
        </span>
      )}

      {/* Category Badge - top right */}
      <span className="absolute top-0 right-0 z-10 bg-[#1A8C4E] text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-bl-2xl shadow-sm">
        {category}
      </span>

      {/* Image Container */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={`${name} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-6">
            <svg
              className="w-12 h-12 stroke-current mb-2 opacity-60"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="1" y1="20" x2="23" y2="20" />
              <path d="M12 5V15M9 8h6" />
              <circle cx="7" cy="15" r="2" />
              <circle cx="17" cy="15" r="2" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              No Image Available
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div>
          {/* Product Title and Model */}
          <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[#1A8C4E] transition-colors duration-200">
            {name} <span className="font-semibold text-gray-500">{model}</span>
          </h3>

          {/* Pricing */}
          <div className="mt-2 text-2xl font-extrabold text-[#1A8C4E] tracking-tight">
            {formattedPrice}
          </div>
        </div>

        {/* Specifications Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {range && (
            <span className="inline-flex items-center text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
              🔋 <span className="ml-1">{range}</span>
            </span>
          )}
          {battery && (
            <span className="inline-flex items-center text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
              ⚡ <span className="ml-1">{battery}</span>
            </span>
          )}
        </div>

        {/* Role-Based Call to Action */}
        <div className="pt-2">
          {isAdmin ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/products/${id}`}
                className="block text-center py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all duration-200"
              >
                Specs Sheet
              </Link>
              <Link
                href="/admin"
                className="block text-center py-2.5 bg-[#1A8C4E] hover:bg-[#15723f] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              href={`/products/${id}`}
              className="block w-full text-center py-3 bg-[#1A8C4E]/10 hover:bg-[#1A8C4E] text-[#1A8C4E] hover:text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-sm"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
