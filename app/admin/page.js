"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });
  const [latestInquiries, setLatestInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch products count
        const productsSnapshot = await getDocs(collection(db, "products"));
        const totalProducts = productsSnapshot.size;

        // Fetch inquiries count
        const inquiriesSnapshot = await getDocs(collection(db, "inquiries"));
        const totalInquiries = inquiriesSnapshot.size;

        // Fetch new inquiries count
        let newInquiries = 0;
        inquiriesSnapshot.forEach((doc) => {
          if (doc.data().status === "new") {
            newInquiries += 1;
          }
        });

        setStats({
          totalProducts,
          totalInquiries,
          newInquiries,
        });

        // Fetch last 5 inquiries ordered by createdAt descending
        const latestInquiriesQuery = query(
          collection(db, "inquiries"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const latestSnapshot = await getDocs(latestInquiriesQuery);
        const inquiriesList = latestSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLatestInquiries(inquiriesList);
      } catch (error) {
        console.error("Error fetching admin stats: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col w-full">
        {/* Dashboard Content */}
        <main className="px-4 sm:px-8 lg:px-12 py-10 flex-grow w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time stock indicators and customer relationship management.
              </p>
            </div>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <Link
                href="/admin/add-product"
                className="bg-[#1A8C4E] hover:bg-[#15723f] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-150 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>➕ Add New EV</span>
              </Link>
              <Link
                href="/admin/inquiries"
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold px-6 py-3 rounded-xl text-sm transition-all duration-150 shadow-sm flex items-center space-x-2"
              >
                <span>✉️ View Inquiries</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1A8C4E] mb-4" />
              <p className="text-sm font-semibold tracking-wide text-gray-500 animate-pulse">
                Loading dashboard metrics...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Products */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Total EV Products
                    </p>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2">
                      {stats.totalProducts}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                    🚲
                  </div>
                </div>

                {/* Total Inquiries */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Total Inquiries
                    </p>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2">
                      {stats.totalInquiries}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">
                    📬
                  </div>
                </div>

                {/* New Inquiries */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      New Inquiries
                    </p>
                    <h3 className="text-3xl font-extrabold text-red-600 mt-2">
                      {stats.newInquiries}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl">
                    🚨
                  </div>
                </div>
              </div>

              {/* Latest 5 Inquiries Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Latest 5 Customer Inquiries</h3>
                  <Link
                    href="/admin/inquiries"
                    className="text-sm font-bold text-[#1A8C4E] hover:text-[#15723f] transition-all"
                  >
                    View All Inquiries ➔
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  {latestInquiries.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Customer Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {latestInquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {inq.customerName}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-600 font-medium">
                              {inq.phone}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-900 font-semibold">
                              {inq.productName || "N/A"}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500 font-medium">
                              {formatDate(inq.createdAt)}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  inq.status === "new"
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : inq.status === "read"
                                    ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {inq.status === "new" ? "New" : inq.status === "read" ? "Read" : "Closed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <p className="text-sm font-semibold">No inquiries submitted yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Inquiries from customers will show up here automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
