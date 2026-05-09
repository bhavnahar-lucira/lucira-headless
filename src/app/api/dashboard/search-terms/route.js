import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("search_synonyms");

    const synonyms = await collection.find({}).sort({ title: 1 }).toArray();

    return NextResponse.json({
      success: true,
      synonyms,
    });
  } catch (error) {
    console.error("Fetch synonyms error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, title, synonyms } = body;

    if (!title || !synonyms) {
      return NextResponse.json(
        { success: false, error: "Title and synonyms are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("search_synonyms");

    const synonymList = Array.isArray(synonyms) 
      ? synonyms.map(s => s.trim()).filter(Boolean)
      : synonyms.split(",").map(s => s.trim()).filter(Boolean);

    const data = {
      title: title.trim(),
      synonyms: synonymList,
      updatedAt: new Date(),
    };

    let result;
    if (id) {
      result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
    } else {
      data.createdAt = new Date();
      result = await collection.insertOne(data);
    }

    return NextResponse.json({
      success: true,
      message: id ? "Synonym group updated" : "Synonym group created",
      result,
    });
  } catch (error) {
    console.error("Save synonym error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("next_local_db");
    const collection = db.collection("search_synonyms");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "Synonym group deleted",
      result,
    });
  } catch (error) {
    console.error("Delete synonym error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
