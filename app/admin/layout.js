"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar automatically when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      
      {/* A. MOBILE TOP BAR */}
      <div className="md:hidden h-20 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-extrabold tracking-wider text-[#1A8C4E]">
            HELOKOEV
          </span>
          <span className="text-[9px] uppercase font-bold tracking-widest bg-[#1A8C4E]/20 text-[#1A8C4E] px-2 py-0.5 rounded-full">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A8C4E]"
          aria-label="Toggle navigation drawer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* B. BACKDROP BLUR OVERLAY (Mobile only) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
        />
      )}

      {/* C. SIDEBAR NAVIGATION */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 z-40 transition-transform duration-300 ease-in-out shrink-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div>
          {/* Brand Logo Banner */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-wider text-[#1A8C4E]">
                HELOKOEV
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest bg-[#1A8C4E]/20 text-[#1A8C4E] px-2 py-0.5 rounded-full">
                Admin
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2 mt-4">
            <Link
              href="/admin"
              className={`flex items-center space-x-3.5 px-4.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                pathname === "/admin"
                  ? "bg-[#1A8C4E] text-white shadow-lg shadow-[#1A8C4E]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">📊</span>
              <span>Dashboard Overview</span>
            </Link>
            <Link
              href="/admin/add-product"
              className={`flex items-center space-x-3.5 px-4.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                pathname === "/admin/add-product"
                  ? "bg-[#1A8C4E] text-white shadow-lg shadow-[#1A8C4E]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">➕</span>
              <span>Add New Product</span>
            </Link>
            <Link
              href="/admin/inquiries"
              className={`flex items-center space-x-3.5 px-4.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                pathname === "/admin/inquiries"
                  ? "bg-[#1A8C4E] text-white shadow-lg shadow-[#1A8C4E]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">✉️</span>
              <span>Customer Inquiries</span>
            </Link>
          </nav>
        </div>

        {/* User Logged In Profile Card & Log Out */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-[#1A8C4E]">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate max-w-[170px]">Administrator</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[170px]">admin@helokoev.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-950/20 hover:bg-red-950/55 border border-red-900/30 hover:border-red-900/50 text-red-400 hover:text-red-300 font-bold py-3 px-4 rounded-xl transition-all duration-150 text-xs uppercase tracking-wider"
          >
            <span>Log Out ➔</span>
          </button>
        </div>
      </aside>

      {/* D. MAIN CONTENT PANE */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        <main className="p-4 sm:p-8 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
}
