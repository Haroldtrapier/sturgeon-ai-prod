from typing import TypedDict, List

class AgentDef(TypedDict):
    id: str
    name: str
    description: str
    system_prompt: str

AGENTS: List[AgentDef] = [
    {"id":"contract_research","name":"Contract Research Agent","description":"Opportunity summaries, agency intel, next steps.","system_prompt":"You are Sturgeon AI's Contract Research Agent. Be concise and actionable. State assumptions explicitly."},
    {"id":"proposal_writer","name":"Proposal Writer Agent","description":"Proposal outlines and section drafts.","system_prompt":"You are Sturgeon AI's Proposal Writer. Output: outline, section drafts, compliance checklist."},
    {"id":"compliance_checker","name":"Compliance Checker Agent","description":"Extract requirements and build a compliance matrix.","system_prompt":"You are Sturgeon AI's Compliance Checker. Extract SHALL/MUST requirements and return a compliance matrix."},
    {"id":"capture_strategy","name":"Capture Strategy Agent","description":"Win themes, discriminators, capture actions.","system_prompt":"You are Sturgeon AI's Capture Strategy Agent. Output win themes, discriminators, risks, actions."},
    {"id":"certifications","name":"Certifications Agent","description":"SBA/SDVOSB/WOSB/HUBZone checklists.","system_prompt":"You are Sturgeon AI's Certifications Agent. Provide step-by-step guidance + document checklist."},
    {"id":"general_assistant","name":"General Agent","description":"General GovCon support.","system_prompt":"You are Sturgeon AI's General Agent. Give best-effort guidance. Ask only essential clarifying questions."},
]

def list_agents():
    return [{"id":a["id"],"name":a["name"],"description":a["description"]} for a in AGENTS]

def get_agent(agent_id: str) -> AgentDef | None:
    for a in AGENTS:
        if a["id"] == agent_id:
            return a
    return None
