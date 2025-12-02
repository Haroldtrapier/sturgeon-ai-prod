// In-memory storage for demonstration purposes
// In production, this would be a database

type Opportunity = {
  id: string;
  title: string;
  agency: string | null;
  source: string;
  status: string;
  metadata: any;
  createdAt: string;
};

// Global storage (persists across requests in the same process)
const opportunities: Opportunity[] = [];

export function getOpportunities(): Opportunity[] {
  return opportunities;
}

export function addOpportunity(opportunity: Opportunity): void {
  opportunities.push(opportunity);
}
