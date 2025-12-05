// In-memory storage for demo purposes
// In production, this would be a database with proper synchronization
// NOTE: This implementation is not thread-safe and will lose data on server restart

export type Document = {
  id: string;
  filename: string;
  text: string | null;
  createdAt: string;
};

let documents: Document[] = [];

export const documentStorage = {
  getAll: () => documents,
  
  add: (doc: Document) => {
    documents.push(doc);
    return doc;
  },
  
  delete: (id: string) => {
    const index = documents.findIndex((d) => d.id === id);
    if (index !== -1) {
      documents.splice(index, 1);
      return true;
    }
    return false;
  },
  
  findById: (id: string) => {
    return documents.find((d) => d.id === id);
  },
};
