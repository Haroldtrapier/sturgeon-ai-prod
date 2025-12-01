// lib/db.ts
// TEMPORARY placeholder store. Replace with Prisma or Supabase logic.

export type ProposalRecord = {
  id: string;
  title: string;
  rawText: string;
  ownerId: string;
};

export type EmbeddingRecord = {
  id: string;
  proposalId: string;
  vector: number[];
};

const proposals: ProposalRecord[] = [];
const embeddings: EmbeddingRecord[] = [];

export const db = {
  proposals: {
    create(p: ProposalRecord): ProposalRecord {
      proposals.push(p);
      return p;
    },
    findById(id: string): ProposalRecord | null {
      return proposals.find((p) => p.id === id) || null;
    },
    list(): ProposalRecord[] {
      return proposals;
    },
  },
  embeddings: {
    create(e: EmbeddingRecord): EmbeddingRecord {
      embeddings.push(e);
      return e;
    },
    findById(id: string): EmbeddingRecord | null {
      return embeddings.find((e) => e.id === id) || null;
    },
    list(): EmbeddingRecord[] {
      return embeddings;
    },
  },
};
