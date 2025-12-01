import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

// Helper function to validate string arrays
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

// Helper function to validate optional string
function isOptionalString(value: unknown): value is string | null | undefined {
  return value === null || value === undefined || typeof value === "string";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch((error) => {
    console.error("Failed to parse request body:", error);
    return {};
  });

  // Validate input types
  const validationErrors: string[] = [];

  if (!isOptionalString(body.companyName)) {
    validationErrors.push("companyName must be a string or null");
  }
  if (body.naicsCodes !== undefined && !isStringArray(body.naicsCodes)) {
    validationErrors.push("naicsCodes must be an array of strings");
  }
  if (body.pscCodes !== undefined && !isStringArray(body.pscCodes)) {
    validationErrors.push("pscCodes must be an array of strings");
  }
  if (!isOptionalString(body.cageCode)) {
    validationErrors.push("cageCode must be a string or null");
  }
  if (!isOptionalString(body.duns)) {
    validationErrors.push("duns must be a string or null");
  }
  if (!isOptionalString(body.capabilitiesSummary)) {
    validationErrors.push("capabilitiesSummary must be a string or null");
  }
  if (body.certifications !== undefined && !isStringArray(body.certifications)) {
    validationErrors.push("certifications must be an array of strings");
  }
  if (!isOptionalString(body.phone)) {
    validationErrors.push("phone must be a string or null");
  }
  if (!isOptionalString(body.website)) {
    validationErrors.push("website must be a string or null");
  }

  if (validationErrors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 });
  }

  const data = {
    companyName: body.companyName ?? null,
    naicsCodes: (body.naicsCodes as string[]) ?? [],
    pscCodes: (body.pscCodes as string[]) ?? [],
    cageCode: body.cageCode ?? null,
    duns: body.duns ?? null,
    capabilitiesSummary: body.capabilitiesSummary ?? null,
    certifications: (body.certifications as string[]) ?? [],
    phone: body.phone ?? null,
    website: body.website ?? null,
  };

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: data,
    create: { ...data, userId: user.id },
  });

  return NextResponse.json({ profile });
}
