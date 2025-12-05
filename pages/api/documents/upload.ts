import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import { documentStorage } from "@/lib/documentStorage";
import fs from "fs";
import { promisify } from "util";
import { randomUUID } from "crypto";

const readFile = promisify(fs.readFile);

// Allowed file types (MIME types)
const ALLOWED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function extractText(file: File): Promise<string | null> {
  try {
    // Only process text files for now
    // In production, you'd use libraries like pdf-parse for PDF, mammoth for DOCX, etc.
    if (file.mimetype === "text/plain") {
      const content = await readFile(file.filepath, "utf-8");
      return content;
    }
    
    // For other file types, return null (text will be extracted in future)
    return null;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { files } = await parseForm(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "File size exceeds 10MB limit" });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(uploadedFile.mimetype || "")) {
      return res.status(400).json({ 
        error: "Invalid file type. Allowed types: .txt, .pdf, .doc, .docx" 
      });
    }

    const text = await extractText(uploadedFile);

    const document = {
      id: randomUUID(),
      filename: uploadedFile.originalFilename || "untitled",
      text,
      createdAt: new Date().toISOString(),
    };

    documentStorage.add(document);

    return res.status(200).json({ document });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload document" });
  }
}
