import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, email, message, productId, productName } = body;

    // Validate name and phone
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: "Customer Name is required" },
        { status: 400 }
      );
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone Number is required" },
        { status: 400 }
      );
    }

    // Insert into Firestore
    const docRef = await addDoc(collection(db, "inquiries"), {
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      message: message ? message.trim() : "",
      productId: productId || "",
      productName: productName || "",
      status: "new",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("Inquiries API POST Error: ", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
