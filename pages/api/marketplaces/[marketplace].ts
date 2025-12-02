import type { NextApiRequest, NextApiResponse } from "next";

type Result = {
  id: string;
  title: string;
  agency: string | null;
  status: string;
  source: string;
};

type ApiResponse = {
  results?: Result[];
  error?: string;
};

// Placeholder data for different marketplaces
const placeholderData: Record<string, Result[]> = {
  sam: [
    {
      id: "SAM-001",
      title: "IT Services for Federal Agency",
      agency: "Department of Defense",
      status: "Active",
      source: "sam",
    },
    {
      id: "SAM-002",
      title: "Cloud Computing Infrastructure",
      agency: "General Services Administration",
      status: "Active",
      source: "sam",
    },
    {
      id: "SAM-003",
      title: "Cybersecurity Consulting Services",
      agency: "Department of Homeland Security",
      status: "Active",
      source: "sam",
    },
  ],
  govwin: [
    {
      id: "GW-001",
      title: "Professional Services Contract",
      agency: "Department of Veterans Affairs",
      status: "Upcoming",
      source: "govwin",
    },
    {
      id: "GW-002",
      title: "Data Analytics Platform",
      agency: "Department of Commerce",
      status: "Active",
      source: "govwin",
    },
  ],
  govspend: [
    {
      id: "GS-001",
      title: "Software Development Services",
      agency: "Department of Energy",
      status: "Active",
      source: "govspend",
    },
    {
      id: "GS-002",
      title: "Network Infrastructure Upgrade",
      agency: "Department of Education",
      status: "Active",
      source: "govspend",
    },
  ],
  unison: [
    {
      id: "UN-001",
      title: "Research and Development",
      agency: "National Science Foundation",
      status: "Active",
      source: "unison",
    },
    {
      id: "UN-002",
      title: "Training and Development Services",
      agency: "Department of Labor",
      status: "Upcoming",
      source: "unison",
    },
  ],
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { marketplace, q } = req.query;

  if (!marketplace || typeof marketplace !== "string") {
    return res.status(400).json({ error: "Invalid marketplace parameter" });
  }

  const query = typeof q === "string" ? q.toLowerCase() : "";

  // Get placeholder data for the marketplace
  const data = placeholderData[marketplace] || [];

  // Filter results based on query if provided
  const results = query
    ? data.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.agency?.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
      )
    : data;

  return res.status(200).json({ results });
}
