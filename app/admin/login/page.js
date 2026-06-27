"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auto-redirect if already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === "admin@helokoev.com") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoadingAdmin(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      console.error("Admin Login Error: ", err);
      let friendlyError = "Authentication failed. Please check admin credentials.";
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        friendlyError = "Invalid admin email or password. Access Denied.";
      }
      setError(friendlyError);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/"); // Direct customer to standard homepage
    } catch (err) {
      console.error("Google Login Error: ", err);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1A8C4E] mb-4" />
        <p className="text-sm font-semibold tracking-wide text-gray-500 animate-pulse">
          Loading authentication portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center mb-8">
        <span className="text-3xl font-extrabold tracking-wider text-[#1A8C4E]">
          HELOKOEV
        </span>
        <span className="ml-1.5 text-xs uppercase font-bold tracking-widest bg-[#1A8C4E]/10 text-[#1A8C4E] px-2 py-0.5 rounded-full">
          Portal
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome to HELOKOEV
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Please authenticate to view catalog features or manage warehouse stock.
        </p>
      </div>

      {/* Auth Portal Panel */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* LEFT PORTION: Customer Login (Google Sign-In) */}
          <div className="p-8 sm:p-12 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-gray-100 text-center">
            <div className="space-y-4 my-auto">
              <span className="text-4xl">👤</span>
              <h3 className="text-2xl font-bold text-gray-950">Customer Sign In</h3>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Log in as a customer using your Google Account to save inquiry forms and contact dealers.
              </p>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              disabled={loadingGoogle}
              className="w-full mt-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-250 border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-150 text-sm flex items-center justify-center space-x-2.5 disabled:opacity-50"
            >
              {loadingGoogle ? (
                <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT PORTION: Admin Login (Email & Password) */}
          <div className="p-8 sm:p-12 bg-gray-50 flex flex-col justify-between">
            <form onSubmit={handleAdminLogin} className="space-y-5 my-auto">
              <div className="text-center md:text-left mb-6">
                <h3 className="text-2xl font-bold text-gray-950">Admin Sign In</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Access dashboard keys and product listings.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@helokoev.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#1A8C4E] focus:outline-none transition-all duration-150 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loadingAdmin}
                className="w-full py-3.5 bg-[#1A8C4E] hover:bg-[#15723f] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-150 text-sm disabled:opacity-50 flex items-center justify-center"
              >
                {loadingAdmin ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Administrator Login"
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
