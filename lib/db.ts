/**
 * Simple in-memory database for proposals and embeddings
 */

interface Proposal {
  id: string;
  title: string;
  rawText?: string;
  createdAt: Date;
}

interface Embedding {
  id: string;
  proposalId: string;
  vector: number[];
}

interface ProposalInput {
  id: string;
  title: string;
  rawText?: string;
}

interface EmbeddingInput {
  id: string;
  proposalId: string;
  vector: number[];
}

// In-memory storage
const proposals: Map<string, Proposal> = new Map();
const embeddings: Map<string, Embedding> = new Map();

export const db = {
  proposals: {
    list(): Proposal[] {
      return Array.from(proposals.values());
    },
    findById(id: string): Proposal | undefined {
      return proposals.get(id);
    },
    create(data: ProposalInput): Proposal {
      const proposal: Proposal = {
        ...data,
        createdAt: new Date(),
      };
      proposals.set(proposal.id, proposal);
      return proposal;
    },
    delete(id: string): boolean {
      return proposals.delete(id);
    },
  },
  embeddings: {
    list(): Embedding[] {
      return Array.from(embeddings.values());
    },
    findByProposalId(proposalId: string): Embedding | undefined {
      return Array.from(embeddings.values()).find(
        (e) => e.proposalId === proposalId
      );
    },
    create(data: EmbeddingInput): Embedding {
      const embedding: Embedding = { ...data };
      embeddings.set(embedding.id, embedding);
      return embedding;
    },
    delete(id: string): boolean {
      return embeddings.delete(id);
    },
  },
};
