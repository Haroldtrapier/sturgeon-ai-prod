"""
AI Agent Chat Router - Multi-agent conversational interface.
Supports 6 specialized agents with session management.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.auth import get_user, get_optional_user
from services.db import (
    create_conversation,
    save_message,
    get_conversation_messages,
    get_user_conversations,
    update_conversation,
    get_company,
    get_opportunity,
)

router = APIRouter(prefix="/api/agents", tags=["ai-agents"])


class AgentChatRequest(BaseModel):
    message: str
    agent_type: str = "general"
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class AgentChatResponse(BaseModel):
    reply: str
    agent_type: str
    agent_name: str
    session_id: str
    metadata: Optional[Dict[str, Any]] = None


# ── Agent Chat ────────────────────────────────────────────────────────

@router.post("/chat", response_model=AgentChatResponse)
async def chat_with_agent(
    request: AgentChatRequest,
    user=Depends(get_user),
):
    """Chat with a specialized AI agent."""
    from agents import get_agent, list_agents

    agent = get_agent(request.agent_type)
    if not agent:
        available = [a["id"] for a in list_agents()]
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{request.agent_type}' not found. Available: {available}",
        )

    # Get or create session
    session_id = request.session_id
    if not session_id:
        session = create_conversation(
            user_id=user["id"],
            agent_type=request.agent_type,
            title=request.message[:100],
        )
        session_id = session["id"] if session else None

    # Build context from user profile and optional data
    context = request.context or {}
    company = get_company(user["id"])
    if company:
        context["user_profile"] = {
            "company_name": company.get("company_name", ""),
            "naics_codes": company.get("naics_codes", []),
            "certifications": ["SDVOSB"] if company.get("sdvosb_certified") else [],
            "cage_code": company.get("cage_code", ""),
        }

    # If context includes an opportunity_id, fetch it
    if context.get("opportunity_id"):
        opp = get_opportunity(context["opportunity_id"])
        if opp:
            context["opportunity"] = opp

    # Get conversation history for context
    history = []
    if session_id:
        messages = get_conversation_messages(session_id, limit=10)
        for msg in messages:
            history.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })

    # Save user message
    if session_id:
        save_message(session_id, "user", request.message)

    # Get agent response
    try:
        reply = await agent.chat(
            message=request.message,
            context=context,
            history=history[-8:] if history else None,  # Last 8 messages for context
        )
    except Exception as e:
        reply = f"I encountered an error processing your request: {str(e)}. Please try again."

    # Save assistant response
    if session_id:
        save_message(session_id, "assistant", reply, metadata={
            "agent_type": request.agent_type,
            "agent_name": agent.name,
        })
        # Update session title if it's the first message
        if len(history) == 0:
            update_conversation(session_id, {"title": request.message[:100]})

    return AgentChatResponse(
        reply=reply,
        agent_type=request.agent_type,
        agent_name=agent.name,
        session_id=session_id or "",
        metadata={
            "has_context": bool(context),
            "history_length": len(history),
        },
    )


# ── Agent-Specific Endpoints ─────────────────────────────────────────

@router.post("/analyze-opportunity")
async def analyze_opportunity(
    opportunity_id: str,
    user=Depends(get_user),
):
    """Use Research Agent to analyze a specific opportunity."""
    opp = get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    company = get_company(user["id"])
    user_profile = {}
    if company:
        user_profile = {
            "company_name": company.get("company_name", ""),
            "naics_codes": company.get("naics_codes", []),
            "certifications": ["SDVOSB"] if company.get("sdvosb_certified") else [],
            "cage_code": company.get("cage_code", ""),
        }

    from agents import get_agent
    researcher = get_agent("research")
    analysis = await researcher.analyze_opportunity(opp, user_profile)

    return {
        "opportunity_id": opportunity_id,
        "opportunity_title": opp.get("title", ""),
        "analysis": analysis,
        "agent": "research",
    }


@router.post("/draft-proposal-section")
async def draft_proposal_section(
    opportunity_id: str,
    section_type: str = "Executive Summary",
    user=Depends(get_user),
):
    """Use Proposal Assistant to draft a proposal section."""
    opp = get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    company = get_company(user["id"])
    user_profile = {}
    if company:
        user_profile = {
            "company_name": company.get("company_name", ""),
            "naics_codes": company.get("naics_codes", []),
            "certifications": ["SDVOSB"] if company.get("sdvosb_certified") else [],
        }

    from agents import get_agent
    writer = get_agent("proposal")
    content = await writer.draft_section(section_type, opp, user_profile)

    return {
        "opportunity_id": opportunity_id,
        "section_type": section_type,
        "content": content,
        "agent": "proposal",
    }


# ── Session Management ────────────────────────────────────────────────

@router.get("/sessions")
async def list_sessions(user=Depends(get_user)):
    """List user's chat sessions."""
    sessions = get_user_conversations(user["id"])
    return {"sessions": sessions, "total": len(sessions)}


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    limit: int = 50,
    user=Depends(get_user),
):
    """Get messages for a chat session."""
    messages = get_conversation_messages(session_id, limit=limit)
    return {"messages": messages, "total": len(messages), "session_id": session_id}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user=Depends(get_user)):
    """Delete a chat session."""
    from services.db import supabase
    supabase.table("chat_sessions").delete().eq("id", session_id).eq("user_id", user["id"]).execute()
    return {"deleted": True, "session_id": session_id}


# ── Agent Directory ───────────────────────────────────────────────────

@router.get("/available")
async def list_available_agents():
    """List all available AI agents."""
    from agents import list_agents
    return {"agents": list_agents()}
