import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/openai";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denom) return 0;
  return dot / denom;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const targetText = (body.text as string) ?? "";

  if (!targetText.trim()) {
    return NextResponse.json(
      { error: "text is required" },
      { status: 400 },
    );
  }

  const targetEmbedding = await embedText(targetText);

  // Build embeddings for proposals if missing
  const allProposals = db.proposals.list();
  const allEmbeddings = db.embeddings.list();

  for (const p of allProposals) {
    const has = allEmbeddings.find((e) => e.proposalId === p.id);
    if (!has) {
      const vec = await embedText(p.rawText || p.title);
      db.embeddings.create({
        id: randomUUID(),
        proposalId: p.id,
        vector: vec,
      });
    }
  }

  const updated = db.embeddings.list();
  const scored = updated.map((e) => {
    const score = cosineSimilarity(targetEmbedding, e.vector);
    return {
      proposalId: e.proposalId,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 10).map((r) => {
    const p = db.proposals.findById(r.proposalId);
    return {
      proposalId: r.proposalId,
      title: p?.title ?? "Unknown",
      fitScore: r.score,
      source: "ContractMatch Embedding Engine",
      why: "High semantic similarity between opportunity text and saved proposal(s).",
    };
  });

  return NextResponse.json({ recommendations: top });
}
