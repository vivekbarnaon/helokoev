"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import ProductForm from "@/components/ProductForm";

export default function AddProductPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col w-full">
        {/* Form Area */}
        <main className="px-4 sm:px-8 lg:px-12 py-10 flex-grow w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Add New Electric Vehicle
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add products to your catalog to make them visible to public customers.
            </p>
          </div>

          <ProductForm />
        </main>
      </div>
    </AdminGuard>
  );
}
