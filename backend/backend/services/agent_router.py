from backend.services.agents_registry import get_agent
from backend.services.llm import llm_chat

def _classify(message: str) -> tuple[str, str]:
    m = message.lower()
    rules = [
        ("compliance_checker", ["shall","must","requirements","compliance","matrix","checklist"]),
        ("proposal_writer", ["proposal","technical approach","executive summary","volume","write"]),
        ("contract_research", ["summarize","research","agency","rfp","solicitation","opportunity"]),
        ("capture_strategy", ["capture","win theme","competitor","positioning","strategy"]),
        ("certifications", ["sdvosb","wosb","hubzone","8(a)","sba certification","certification"]),
    ]
    for aid, keys in rules:
        if any(k in m for k in keys):
            return aid, f"Matched keywords for {aid}"
    return "general_assistant", "Defaulted to general agent"

def route_message(message: str, override: str | None, context: dict):
    if override:
        agent = get_agent(override)
        if agent:
            reply = llm_chat(agent["system_prompt"], message)
            return {"agentId": agent["id"], "agentName": agent["name"], "routingReason": "User override", "reply": reply}

    agent_id, reason = _classify(message)
    agent = get_agent(agent_id) or get_agent("general_assistant")
    reply = llm_chat(agent["system_prompt"], message)  # type: ignore
    return {"agentId": agent["id"], "agentName": agent["name"], "routingReason": reason, "reply": reply}
