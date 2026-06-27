"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser && currentUser.email === "admin@helokoev.com");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-wider text-[#1A8C4E]">
                HELOKOEV
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-[#1A8C4E]/10 text-[#1A8C4E] px-2 py-0.5 rounded-full">
                Warehouse
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-[#1A8C4E] font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/#catalog"
              className="text-gray-600 hover:text-[#1A8C4E] font-medium transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              href="/#contact"
              className="text-gray-600 hover:text-[#1A8C4E] font-medium transition-colors duration-200"
            >
              Contact
            </Link>
            
            {/* Dynamic Role-Based Auth UI */}
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="bg-[#1A8C4E] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#15723f] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Dashboard ⚙️
                  </Link>
                ) : (
                  <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-full">
                    👋 Hi, {user.displayName || "Customer"}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-full font-bold text-xs transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full font-bold text-xs transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-500 hover:text-[#1A8C4E] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1A8C4E] transition-all duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-6 space-y-3 bg-white border-t border-gray-50 shadow-inner">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-[#1A8C4E] hover:bg-gray-50 transition-all duration-150"
          >
            Home
          </Link>
          <Link
            href="/#catalog"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-[#1A8C4E] hover:bg-gray-50 transition-all duration-150"
          >
            Products
          </Link>
          <Link
            href="/#contact"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-[#1A8C4E] hover:bg-gray-50 transition-all duration-150"
          >
            Contact
          </Link>
          <div className="pt-2">
            {user ? (
              <div className="space-y-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium bg-[#1A8C4E] text-white"
                  >
                    Dashboard ⚙️
                  </Link>
                ) : (
                  <div className="block w-full text-center px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-50 rounded-lg">
                    👋 Hi, {user.displayName || "Customer"}
                  </div>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
