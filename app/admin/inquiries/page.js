"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Listen to inquiries collection in real-time
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const inquiriesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInquiries(inquiriesList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inquiries: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id, newStatus, e) => {
    e.stopPropagation(); // Avoid triggering row expansion toggles
    try {
      const docRef = doc(db, "inquiries", id);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Customer Inquiries
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage inquiries submitted by public users. Click a row to expand details.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1A8C4E] mb-4" />
              <p className="text-sm font-semibold tracking-wide text-gray-500 animate-pulse">
                Syncing inquiries database...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                {inquiries.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Product Requested
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Date Received
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Quick Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {inquiries.flatMap((inq) => {
                        const isExpanded = expandedId === inq.id;
                        const dateStr = formatDate(inq.createdAt);

                        const row1 = (
                          <tr
                            key={inq.id}
                            onClick={() => toggleExpand(inq.id)}
                            className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${
                              isExpanded ? "bg-gray-50/30" : ""
                            }`}
                          >
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                              {inq.customerName}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                              {inq.phone}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-505 text-gray-500">
                              {inq.email || "—"}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                              {inq.productName || "—"}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                              {dateStr}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
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
                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-semibold">
                              <div className="flex justify-end gap-2">
                                {inq.status !== "read" && (
                                  <button
                                    onClick={(e) => handleUpdateStatus(inq.id, "read", e)}
                                    className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold transition-all"
                                    title="Mark as Read"
                                  >
                                    ✓ Read
                                  </button>
                                )}
                                {inq.status !== "closed" && (
                                  <button
                                    onClick={(e) => handleUpdateStatus(inq.id, "closed", e)}
                                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold transition-all"
                                    title="Mark as Closed"
                                  >
                                    ✕ Close
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );

                        if (isExpanded) {
                          const row2 = (
                            <tr key={`${inq.id}-expanded`} className="bg-gray-50/30">
                              <td colSpan="7" className="px-6 py-6 border-t border-b border-gray-100">
                                <div className="max-w-3xl">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Inquiry Message Details
                                  </h4>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-5 rounded-2xl border border-gray-100 shadow-inner font-medium">
                                    {inq.message || "No custom message provided by the customer."}
                                  </p>

                                  <div className="flex gap-6 mt-4 text-xs font-semibold text-gray-400">
                                    <div>
                                      <span>Product ID Reference: </span>
                                      <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                        {inq.productId || "—"}
                                      </span>
                                    </div>
                                    <div>
                                      <span>Customer Email: </span>
                                      <span className="text-gray-600">{inq.email || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                          return [row1, row2];
                        }

                        return [row1];
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <p className="text-sm font-semibold">No inquiries submitted yet.</p>
                    <p className="text-xs text-gray-400 mt-1">When customers submit inquiries, they will immediately show here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
