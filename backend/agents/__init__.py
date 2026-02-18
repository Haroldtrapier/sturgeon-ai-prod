from agents.base_agent import BaseAgent
from agents.research_agent import ResearchAgent
from agents.opportunity_analyst import OpportunityAnalyst
from agents.compliance_specialist import ComplianceSpecialist
from agents.proposal_assistant import ProposalAssistant
from agents.market_analyst import MarketAnalyst
from agents.general_assistant import GeneralAssistant

AGENT_REGISTRY = {
    "research": ResearchAgent(),
    "opportunity": OpportunityAnalyst(),
    "compliance": ComplianceSpecialist(),
    "proposal": ProposalAssistant(),
    "market": MarketAnalyst(),
    "general": GeneralAssistant(),
}


def get_agent(agent_type: str) -> BaseAgent:
    return AGENT_REGISTRY.get(agent_type, AGENT_REGISTRY["general"])


def list_agents():
    return [
        {"id": k, "name": v.name, "description": v.description}
        for k, v in AGENT_REGISTRY.items()
    ]
