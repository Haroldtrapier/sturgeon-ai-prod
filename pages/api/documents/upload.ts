import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import { documentStorage } from "@/lib/documentStorage";
import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

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
    // For now, just read text files directly
    // In production, you'd use libraries for PDF, DOCX, etc.
    const content = await readFile(file.filepath, "utf-8");
    return content;
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

    const text = await extractText(uploadedFile);

    const document = {
      id: Date.now().toString(),
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
