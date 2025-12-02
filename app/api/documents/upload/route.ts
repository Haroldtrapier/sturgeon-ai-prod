import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text || "";
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractTextFromPdf(buffer);
  } else if (name.endsWith(".docx")) {
    return extractTextFromDocx(buffer);
  } else {
    return buffer.toString("utf-8");
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "file size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    const text = await extractText(file);
    return NextResponse.json({
      filename: file.name,
      textExcerpt: text.slice(0, 1000),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "failed to extract text from file" },
      { status: 500 },
    );
  }
}
