import { NextResponse } from "next/server";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(productsList, { status: 200 });
  } catch (error) {
    console.error("Products API GET Error: ", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      model,
      price,
      battery,
      range,
      topSpeed,
      category,
      inStock,
      whatsappNumber,
      images,
      description,
    } = body;

    // Validate essential fields
    if (!name || !model || price === undefined || !category) {
      return NextResponse.json(
        { error: "Product Name, Model, Price, and Category are required." },
        { status: 400 }
      );
    }

    // Insert into Firestore
    const docRef = await addDoc(collection(db, "products"), {
      name: name.trim(),
      model: model.trim(),
      price: Number(price),
      battery: battery ? battery.trim() : "",
      range: range ? range.trim() : "",
      topSpeed: topSpeed ? topSpeed.trim() : "",
      category: category.trim(),
      inStock: Boolean(inStock),
      whatsappNumber: whatsappNumber ? whatsappNumber.trim() : "",
      images: Array.isArray(images) ? images : [],
      description: description ? description.trim() : "",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("Products API POST Error: ", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
