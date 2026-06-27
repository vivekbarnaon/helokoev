"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Role Authorization check: Only admin@helokoev.com can access admin views
      if (currentUser && currentUser.email === "admin@helokoev.com") {
        setUser(currentUser);
        setLoading(false);
      } else {
        setUser(null);
        // Redirect unauthorized users to admin login page
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1A8C4E] mb-4" />
        <p className="text-sm font-semibold tracking-wide text-gray-500 animate-pulse">
          Verifying administrator credentials...
        </p>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
