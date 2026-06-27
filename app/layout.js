import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "HELOKOEV EV Warehouse | Premium Electric Vehicles Catalog",
  description: "Browse the ultimate collection of high-quality E-Cycles, E-Scooters, E-Bikes, and E-Rickshaws. Find specs, view details, and send direct WhatsApp inquiries.",
  keywords: ["Electric Vehicles", "EV Warehouse", "E-Cycle", "E-Scooter", "E-Bike", "E-Rickshaw", "HELOKOEV"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900 min-h-screen flex flex-col antialiased`}>
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer Area */}
        <footer id="contact" className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-extrabold text-lg tracking-wider mb-4">
                  HELOKOEV <span className="text-[#1A8C4E]">EV WAREHOUSE</span>
                </h3>
                <p className="text-sm leading-relaxed max-w-xs">
                  Your trusted source for eco-friendly urban mobility. Delivering reliability, range, and cutting-edge battery technology.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product Categories</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/#catalog" className="hover:text-white transition-colors">E-Cycles</a></li>
                  <li><a href="/#catalog" className="hover:text-white transition-colors">E-Scooters</a></li>
                  <li><a href="/#catalog" className="hover:text-white transition-colors">E-Bikes</a></li>
                  <li><a href="/#catalog" className="hover:text-white transition-colors">E-Rickshaws</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact & Warehouse</h4>
                <p className="text-sm mb-2">📍 Industrial Area, Patliputra, Patna, Bihar, India</p>
                <p className="text-sm mb-2">📧 info@helokoev.com</p>
                <p className="text-sm">📞 +91 93346 64942</p>
              </div>
            </div>
            <div className="border-t border-gray-900 mt-12 pt-6 text-center text-xs">
              <p>&copy; {new Date().getFullYear()} HELOKOEV EV Warehouse. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
