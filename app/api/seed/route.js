import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Create Admin User
    let authMessage = "";
    try {
      await createUserWithEmailAndPassword(
        auth,
        "admin@helokoev.com",
        "AdminPassword@123"
      );
      authMessage = "Admin user created successfully (email: admin@helokoev.com, password: AdminPassword@123).";
    } catch (authError) {
      if (authError.code === "auth/email-already-in-use" || authError.code === "auth/admin-exists") {
        authMessage = "Admin user (admin@helokoev.com) already exists.";
      } else {
        throw authError;
      }
    }

    // 2. Clear existing products to prevent duplicates during multiple seeds
    const existingSnap = await getDocs(collection(db, "products"));
    const deletedCount = existingSnap.size;
    for (const d of existingSnap.docs) {
      await deleteDoc(doc(db, "products", d.id));
    }

    // 3. Create Dummy Products with high-quality free placeholders & bios
    const dummyProducts = [
      {
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

    const seededIds = [];
    for (const p of dummyProducts) {
      const docRef = await addDoc(collection(db, "products"), {
        ...p,
        createdAt: serverTimestamp()
      });
      seededIds.push(docRef.id);
    }

    return NextResponse.json({
      success: true,
      auth: authMessage,
      productsDeleted: deletedCount,
      productsSeededCount: seededIds.length,
      seededProductIds: seededIds
    }, { status: 200 });
  } catch (error) {
    console.error("Seeding API GET Error: ", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
