import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { fileContent } = await req.json();

    // 1. Define where to save the file
    // We will save it in a root folder called "__tests__"
    const dirPath = path.join(process.cwd(), "__tests__");
    const filePath = path.join(dirPath, "generated.test.js");

    // 2. Create folder if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    // 3. Write the file
    fs.writeFileSync(filePath, fileContent);

    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}