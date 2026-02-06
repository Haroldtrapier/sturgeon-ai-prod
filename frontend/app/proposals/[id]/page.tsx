// PHASE 4.5-4.7 UPDATE
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { backend } from "@/lib/backend";
export default function ProposalBuilder() {
  const { id } = useParams();
  // ...other state/hooks as before
  return (
    <main>
      {/* ...existing proposal UI... */}
      <div className="my-4 flex gap-4">
        <a href={`/api/export/proposal/${id}`} target="_blank">
          <button className="px-4 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700">Download Proposal (DOCX)</button>
        </a>
        <a href={`/api/export/compliance/${id}`} target="_blank">
          <button className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">Download Compliance Matrix (DOCX)</button>
        </a>
        <button onClick={() => requestReview(id)} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600">Request Human Review ($99)</button>
      </div>
      {/* ...rest of compliance matrix and sections... */}
      {/* ...status badge, notes display will use review table... */}
    </main>
  );
}

async function requestReview(proposalId: string) {
  await backend.post(`/reviews/request`, { proposal_id: proposalId });
  alert("Human review requested – reviewer will contact you!");
}
