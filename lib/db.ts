export interface Proposal {
  id: string;
  title: string;
  rawText: string;
  ownerId: string;
  createdAt: Date;
}

class InMemoryDB {
  private proposalsStore: Map<string, Proposal> = new Map();

  proposals = {
    create: (data: Omit<Proposal, "createdAt">): Proposal => {
      const proposal: Proposal = {
        ...data,
        createdAt: new Date(),
      };
      this.proposalsStore.set(data.id, proposal);
      return proposal;
    },
    get: (id: string): Proposal | undefined => {
      return this.proposalsStore.get(id);
    },
    list: (): Proposal[] => {
      return Array.from(this.proposalsStore.values());
    },
  };
}

export const db = new InMemoryDB();
