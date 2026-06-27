"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";

const CATEGORIES = ["All", "E-Cycle", "E-Scooter", "E-Bike", "E-Rickshaw"];

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

// Interactive Preview Tabs Database
const PREVIEW_ITEMS = [
  {
    name: "HELOKOEV Aura E-Scooty",
    model: "Aura Pro",
    price: "₹1,15,000",
    range: "120 KM",
    rangePct: "85%",
    speed: "75 KM/H",
    speedPct: "70%",
    battery: "Lithium-LFP Cell",
    batteryPct: "95%",
    id: "mock-scooty-1"
  },
  {
    name: "HELOKOEV Thunder Bike",
    model: "Thunder-X",
    price: "₹1,39,000",
    range: "150 KM",
    rangePct: "98%",
    speed: "95 KM/H",
    speedPct: "92%",
    battery: "Li-Ion High-Density",
    batteryPct: "88%",
    id: "mock-bike-2"
  },
  {
    name: "HELOKOEV Mayuri Rickshaw",
    model: "Mayuri Super",
    price: "₹1,58,000",
    range: "90 KM",
    rangePct: "60%",
    speed: "25 KM/H",
    speedPct: "25%",
    battery: "Heavy Duty Lead Acid",
    batteryPct: "75%",
    id: "mock-rickshaw-4"
  }
];

// Reusable FAQ Accordion Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-150 border-gray-100 py-5 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-bold text-gray-900 hover:text-[#1A8C4E] transition-colors focus:outline-none"
      >
        <span className="text-base sm:text-lg">{question}</span>
        <span className={`text-xl font-medium transform transition-transform duration-300 ${isOpen ? "rotate-45 text-[#1A8C4E]" : "text-gray-400"}`}>
          ＋
        </span>
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-40 mt-3 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [featuredScooty, setFeaturedScooty] = useState(null);

  // Meter and Interactive selector states
  const [selectedPreview, setSelectedPreview] = useState(0);
  const [meterTrigger, setMeterTrigger] = useState(false);

  useEffect(() => {
    // Trigger spec dashboard animation
    setTimeout(() => setMeterTrigger(true), 300);

    const fetchWithTimeout = (promise, ms) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), ms))
      ]);
    };

    async function fetchProducts() {
      try {
        setLoading(true);
        const querySnapshot = await fetchWithTimeout(
          getDocs(collection(db, "products")),
          1500
        );
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        if (productsList.length > 0) {
          setProducts(productsList);
          setFilteredProducts(productsList);
          const scooty = productsList.find((p) => p.category === "E-Scooter");
          setFeaturedScooty(scooty || productsList[0]);
        } else {
          setProducts(MOCK_PRODUCTS);
          setFilteredProducts(MOCK_PRODUCTS);
          setFeaturedScooty(MOCK_PRODUCTS[0]);
        }
      } catch (err) {
        console.error("Firestore loading failed. Rendering default mock products.", err);
        setProducts(MOCK_PRODUCTS);
        setFilteredProducts(MOCK_PRODUCTS);
        setFeaturedScooty(MOCK_PRODUCTS[0]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleFilter = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === category));
    }
  };

  const previewItem = PREVIEW_ITEMS[selectedPreview];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* A. HORIZONTAL LIVE WAREHOUSE TICKER */}
      <div className="bg-gray-950 text-gray-400 text-[11px] font-bold py-3 border-b border-gray-900 overflow-hidden select-none">
        <div className="animate-marquee flex whitespace-nowrap space-x-12 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 shrink-0"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Hub Registry: Online</span>
          <span className="shrink-0">📦 Last Dispatch: Aura E-Scooty to Patna (14m ago)</span>
          <span className="shrink-0">🔋 Safety Clearance: LFP Cell checks passing (100%)</span>
          <span className="shrink-0">🚚 Fleet Capacity: 24 vehicles loaded and ready for delivery</span>
          <span className="shrink-0">🟢 Customer Support: +91 93346 64942 online</span>
          {/* Repeating to allow seamless looping */}
          <span className="flex items-center gap-1.5 shrink-0"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Hub Registry: Online</span>
          <span className="shrink-0">📦 Last Dispatch: Aura E-Scooty to Patna (14m ago)</span>
          <span className="shrink-0">🔋 Safety Clearance: LFP Cell checks passing (100%)</span>
          <span className="shrink-0">🚚 Fleet Capacity: 24 vehicles loaded and ready for delivery</span>
        </div>
      </div>

      {/* 1. Hero Section (Split Layout) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,140,78,0.15),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side: Brand Text */}
            <div className="space-y-6">
              <span className="inline-flex items-center space-x-1.5 bg-[#1A8C4E]/25 text-[#2ec070] text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#1A8C4E]/30 opacity-0 animate-fadeInUp">
                ⚡ HELOKOEV EV Warehouse Dispatch
              </span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight opacity-0 animate-fadeInUp animation-delay-100">
                Premium Electric <br />
                <span className="text-[#1A8C4E] bg-gradient-to-r from-[#22c55e] to-[#16a34a] bg-clip-text text-transparent">
                  Vehicles Hub
                </span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl font-medium opacity-0 animate-fadeInUp animation-delay-200">
                Browse our live inventory of high-performance electric scooties, bikes, cycles, and rickshaws directly from our national warehouse. No middlemen, full guarantees.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2 opacity-0 animate-fadeInUp animation-delay-300">
                <a
                  href="#catalog"
                  className="bg-[#1A8C4E] hover:bg-[#15723f] text-white font-bold py-3.5 px-7 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-sm text-center"
                >
                  Explore Live Fleet
                </a>
                <a
                  href="#featured"
                  className="bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold py-3.5 px-7 rounded-xl transition-all duration-300 text-xs sm:text-sm text-center"
                >
                  Featured Scooty 🛵
                </a>
              </div>
            </div>

            {/* Right Side: Interactive Spec Dashboard */}
            <div className="relative opacity-0 animate-fadeInUp animation-delay-300">
              <div className="absolute inset-0 bg-[#1A8C4E]/10 blur-3xl rounded-full animate-pulse" />
              
              <div className="relative bg-gray-950/70 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6 max-w-md mx-auto hover:border-gray-700/80 transition-all duration-350">
                
                {/* Selector Tabs */}
                <div className="flex space-x-1.5 p-1 bg-gray-900 rounded-xl border border-gray-850 border-gray-800">
                  {PREVIEW_ITEMS.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPreview(idx)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                        selectedPreview === idx
                          ? "bg-[#1A8C4E] text-white shadow-md"
                          : "text-gray-400 hover:text-white hover:bg-gray-850 hover:bg-gray-800/40"
                      }`}
                    >
                      {idx === 0 ? "Scooty 🛵" : idx === 1 ? "Bike ⚡" : "Rickshaw 🛺"}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-[#1A8C4E]/25 text-[#2ec070] px-3 py-1 rounded-full border border-[#1A8C4E]/30">
                    ⚡ Live Spec Preview
                  </span>
                  <span className="text-xs text-gray-400 font-bold">Model: {previewItem.model}</span>
                </div>
                
                <div className="transition-all duration-300">
                  <h3 className="text-xl font-extrabold text-white">
                    {previewItem.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Direct Warehouse Dispatch: <span className="text-[#2ec070] font-extrabold">{previewItem.price}</span></p>
                </div>
                
                <div className="space-y-4 pt-1">
                  {/* Range Meter */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-300 mb-1.5">
                      <span>Max Range</span>
                      <span className="text-[#2ec070]">{previewItem.range}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#1A8C4E] rounded-full transition-all duration-500 ease-out" 
                        style={{ width: meterTrigger ? previewItem.rangePct : "0%" }}
                      />
                    </div>
                  </div>
                  
                  {/* Top Speed Meter */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-300 mb-1.5">
                      <span>Top Speed</span>
                      <span className="text-[#2ec070]">{previewItem.speed}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#1A8C4E] rounded-full transition-all duration-500 ease-out" 
                        style={{ width: meterTrigger ? previewItem.speedPct : "0%" }}
                      />
                    </div>
                  </div>

                  {/* Battery Cell Health */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-300 mb-1.5">
                      <span>Battery Cell Tech</span>
                      <span className="text-[#2ec070]">{previewItem.battery}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#1A8C4E] rounded-full transition-all duration-500 ease-out" 
                        style={{ width: meterTrigger ? previewItem.batteryPct : "0%" }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-850 border-gray-800">
                  <Link 
                    href={`/products/${previewItem.id}`} 
                    className="block text-center w-full py-3.5 bg-[#1A8C4E] hover:bg-[#15723f] text-white text-xs font-bold rounded-xl shadow transition-all duration-200 uppercase tracking-wider"
                  >
                    View Specifications Sheet ➔
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Brand Credentials - Why Choose Us */}
      <section className="bg-white border-b border-gray-100 py-16 opacity-0 animate-fadeInUp animation-delay-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#1A8C4E]/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                🔋
              </div>
              <div>
                <h4 className="font-bold text-gray-950 text-base">Smart LFP Batteries</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Equipped with advanced fire-resistant LFP cell balancing controllers for up to 1500 charge cycles.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#1A8C4E]/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                🚚
              </div>
              <div>
                <h4 className="font-bold text-gray-950 text-base">Warehouse Prices</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Purchase directly from our storage hubs with transparent specifications and zero agent markup.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#1A8C4E]/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                💬
              </div>
              <div>
                <h4 className="font-bold text-gray-950 text-base">Direct WhatsApp Support</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  One-tap access to warehouse management chat for instant custom quotes and delivery logistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Product Showcase Section */}
      {featuredScooty && (
        <section id="featured" className="py-20 bg-gray-50/50 border-b border-gray-100 opacity-0 animate-fadeInUp animation-delay-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[#1A8C4E] font-bold text-xs uppercase tracking-widest bg-[#1A8C4E]/10 px-3.5 py-1.5 rounded-full">
                ★ Featured Highlight
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
                EV Scooty of the Month
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                A closer look at our flagship high-range electric scooty.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 hover:shadow-2xl transition-all duration-300">
              {/* Product Media */}
              <div className="relative aspect-[4/3] lg:aspect-auto w-full bg-gray-100 overflow-hidden group">
                {featuredScooty.images && featuredScooty.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredScooty.images[0]}
                    alt={featuredScooty.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Media Available
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-[#1A8C4E] text-white text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-md shadow-md">
                  {featuredScooty.category}
                </span>
              </div>

              {/* Product Biography Details */}
              <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8">
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-950 leading-tight">
                    {featuredScooty.name}
                  </h3>
                  <p className="text-gray-500 font-semibold text-sm mt-0.5">Model: {featuredScooty.model}</p>
                  
                  {/* Product Bio */}
                  <p className="text-sm text-gray-600 leading-relaxed font-medium mt-4 border-l-4 border-[#1A8C4E] pl-4">
                    {featuredScooty.description || "The ultimate high-performance scooty built for smart cities, zero carbon emissions, and reliable everyday range."}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-center">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Range</span>
                      <span className="text-gray-900 font-extrabold text-base mt-1 block">{featuredScooty.range || "120 km"}</span>
                    </div>
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-center">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Battery</span>
                      <span className="text-gray-900 font-extrabold text-xs sm:text-sm mt-1 block truncate" title={featuredScooty.battery}>{featuredScooty.battery || "LFP Pack"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    href={`/products/${featuredScooty.id}`}
                    className="flex-1 w-full text-center py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all"
                  >
                    Complete Specs sheet
                  </Link>
                  <div className="flex-1 w-full">
                    <WhatsAppButton
                      productName={featuredScooty.name}
                      whatsappNumber={featuredScooty.whatsappNumber || "+91 93346 64942"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Catalog Grid Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow opacity-0 animate-fadeInUp animation-delay-400">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Live EV Fleet Catalog
          </h2>
          <p className="text-gray-500 mt-2">
            Filter our active database by category to locate E-Scooters, Cycles, Bikes, or Rickshaws.
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-200 shadow-sm ${
                activeCategory === cat
                  ? "bg-[#1A8C4E] text-white shadow-md transform scale-102"
                  : "bg-white text-gray-600 hover:text-[#1A8C4E] hover:bg-gray-50 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1A8C4E] mb-4" />
            <p className="text-sm font-semibold tracking-wide text-gray-500 animate-pulse">
              Loading EV Inventory...
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                name={prod.name}
                model={prod.model}
                price={prod.price}
                range={prod.range}
                battery={prod.battery}
                category={prod.category}
                images={prod.images}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Interactive FAQ Accordion Section */}
      <section className="bg-white border-t border-gray-100 py-20 opacity-0 animate-fadeInUp animation-delay-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#1A8C4E] font-bold text-xs uppercase tracking-widest bg-[#1A8C4E]/10 px-3.5 py-1.5 rounded-full">
              ❓ Help Desk
            </span>
            <h2 className="text-3xl font-extrabold text-gray-950 mt-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Find instant answers regarding battery charging, shipping locations, and dealership support.
            </p>
          </div>

          <div className="space-y-1">
            <FAQItem 
              question="What type of battery technology is used in your electric scooters?" 
              answer="We primarily utilize advanced Lithium Iron Phosphate (LFP) cells. LFP technology is inherently fire-resistant, has dynamic thermal stability, and offers an impressive life cycle of up to 1500 charge cycles before any noticeable range degradation."
            />
            <FAQItem 
              question="Can I request a custom quotation and color options directly on WhatsApp?" 
              answer="Yes! By clicking the 'Get WhatsApp Quote' button on any product details page, you are connected directly with our central warehouse manager. You can specify color choices, bulk discounts, and shipping addresses directly."
            />
            <FAQItem 
              question="Do your products come with a warehouse warranty?" 
              answer="Absolutely. All electric vehicles purchased directly from HELOKOEV EV Warehouse carry a standard 3-year warranty on battery packs and a 1-year warranty on hub motors and chassis components."
            />
            <FAQItem 
              question="How are vehicles packaged and shipped?" 
              answer="Vehicles are shipped in heavy-duty wooden crates via major logistics networks. We ensure 90% pre-assembly; customers only need to secure handle adjustments and side mirrors on delivery."
            />
          </div>
        </div>
      </section>

    </div>
  );
}
