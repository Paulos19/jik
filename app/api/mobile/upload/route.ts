import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_for_nunu_dev";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const utapi = new UTApi();
    const response = await utapi.uploadFiles(file);

    if (response.error) {
      console.error("UploadThing Error:", response.error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url: response.data.url });

  } catch (error) {
    console.error("POST /api/mobile/upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
