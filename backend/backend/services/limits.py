from datetime import datetime, timedelta
from backend.services.db import supabase

# Plan limits
PLAN_LIMITS = {
    "free": {
        "chats_per_day": 10,
        "saved_conversations": 5,
        "agents": ["general_assistant"],
        "features": ["basic_chat"]
    },
    "pro": {
        "chats_per_day": -1,  # Unlimited
        "saved_conversations": -1,  # Unlimited
        "agents": "all",
        "features": ["basic_chat", "saved_history", "all_agents", "priority_support"]
    },
    "enterprise": {
        "chats_per_day": -1,
        "saved_conversations": -1,
        "agents": "all",
        "features": ["basic_chat", "saved_history", "all_agents", "priority_support", "api_access", "custom_agents"]
    }
}

def can_chat(user_id: str, plan: str) -> tuple[bool, str]:
    """Check if user can chat based on plan limits"""
    
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    # Pro and enterprise have unlimited chats
    if limits["chats_per_day"] == -1:
        return True, ""
    
    # Check daily usage for free plan
    today = datetime.now().date()
    result = supabase.table("messages") \
        .select("id", count="exact") \
        .gte("created_at", today.isoformat()) \
        .execute()
    
    daily_count = result.count or 0
    
    if daily_count >= limits["chats_per_day"]:
        return False, f"Daily limit reached ({limits['chats_per_day']} chats). Upgrade to Pro for unlimited chats."
    
    return True, ""

def can_use_agent(plan: str, agent_id: str) -> tuple[bool, str]:
    """Check if user can use specific agent"""
    
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    # Pro and enterprise can use all agents
    if limits["agents"] == "all":
        return True, ""
    
    # Free users can only use general assistant
    if agent_id not in limits["agents"]:
        return False, f"This agent requires Pro plan. Upgrade to access all agents."
    
    return True, ""

def can_save_conversation(user_id: str, plan: str) -> tuple[bool, str]:
    """Check if user can save more conversations"""
    
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    # Pro and enterprise have unlimited conversations
    if limits["saved_conversations"] == -1:
        return True, ""
    
    # Check saved conversation count for free plan
    result = supabase.table("conversations") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .execute()
    
    saved_count = result.count or 0
    
    if saved_count >= limits["saved_conversations"]:
        return False, f"Conversation limit reached ({limits['saved_conversations']} saved). Upgrade to Pro for unlimited history."
    
    return True, ""

def has_feature(plan: str, feature: str) -> bool:
    """Check if plan has specific feature"""
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    return feature in limits["features"]
