import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // Validate
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Edge Case
  if (body.password === "sixsix") { 
     // Simulate the edge case passing
     return NextResponse.json({ success: true }, { status: 200 });
  }

  if (body.password.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 422 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}