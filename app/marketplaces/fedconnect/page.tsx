import MarketplacePlaceholder from "../../components/MarketplacePlaceholder";

export default function FedConnectPage() {
  return (
    <MarketplacePlaceholder
      name="FedConnect"
      loginUrl="https://www.fedconnect.net/"
      description="FedConnect is used by many agencies to post opportunities and manage communication. Sturgeon AI will help you quickly interpret and respond to postings."
      bullets={
        [
          "Log into FedConnect with your account.",
          "Locate new opportunities and messages relevant to your company.",
          "Copy opportunity text, attachments, and Q&A into Sturgeon.",
          "Use AI to summarize requirements, risks, and action items.",
        ]
      }
      comingSoon={
        [
          "Quick-paste analysis mode for FedConnect notices.",
          "Draft message and Q&A responses with AI assistance.",
          "Pipeline tracking of FedConnect opportunities in Sturgeon.",
        ]
      }
    />
  );
}
