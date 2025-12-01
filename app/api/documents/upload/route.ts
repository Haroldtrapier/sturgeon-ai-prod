import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

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
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "file is required" },
      { status: 400 },
    );
  }

  const text = await extractText(file);
  return NextResponse.json({
    filename: file.name,
    textExcerpt: text.slice(0, 1000),
  });
}
