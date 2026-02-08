"""
Supabase database client - single source of truth for all DB operations.
"""
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_KEY", ""))

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── User Profile Operations ──────────────────────────────────────────

def get_user_profile(user_id: str):
    result = supabase.table("user_profiles").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None


def create_user_profile(user_id: str, email: str, full_name: str = ""):
    result = supabase.table("user_profiles").upsert({
        "id": user_id,
        "full_name": full_name,
        "subscription_plan": "free",
    }).execute()
    return result.data[0] if result.data else None


def update_user_profile(user_id: str, updates: dict):
    result = supabase.table("user_profiles").update(updates).eq("id", user_id).execute()
    return result.data[0] if result.data else None


# ── Company Operations ────────────────────────────────────────────────

def get_company(user_id: str):
    result = supabase.table("companies").select("*").eq("user_id", user_id).execute()
    return result.data[0] if result.data else None


def upsert_company(user_id: str, data: dict):
    data["user_id"] = user_id
    result = supabase.table("companies").upsert(data, on_conflict="user_id").execute()
    return result.data[0] if result.data else None


# ── Opportunity Operations ────────────────────────────────────────────

def search_opportunities(filters: dict, limit: int = 50, offset: int = 0):
    query = supabase.table("opportunities").select("*")

    if filters.get("naics_code"):
        query = query.eq("naics_code", filters["naics_code"])
    if filters.get("agency"):
        query = query.ilike("agency", f"%{filters['agency']}%")
    if filters.get("set_aside"):
        query = query.eq("set_aside", filters["set_aside"])
    if filters.get("status"):
        query = query.eq("status", filters["status"])
    if filters.get("search"):
        query = query.or_(
            f"title.ilike.%{filters['search']}%,description.ilike.%{filters['search']}%"
        )

    query = query.order("posted_date", desc=True).range(offset, offset + limit - 1)
    result = query.execute()
    return result.data or []


def get_opportunity(opportunity_id: str):
    result = supabase.table("opportunities").select("*").eq("id", opportunity_id).execute()
    return result.data[0] if result.data else None


def get_opportunity_by_notice_id(notice_id: str):
    result = supabase.table("opportunities").select("*").eq("notice_id", notice_id).execute()
    return result.data[0] if result.data else None


def upsert_opportunity(data: dict):
    result = supabase.table("opportunities").upsert(
        data, on_conflict="notice_id"
    ).execute()
    return result.data[0] if result.data else None


def count_opportunities(filters: dict = None):
    query = supabase.table("opportunities").select("id", count="exact")
    if filters and filters.get("status"):
        query = query.eq("status", filters["status"])
    result = query.execute()
    return result.count or 0


# ── Saved Opportunity Operations ──────────────────────────────────────

def get_saved_opportunities(user_id: str, status: str = None):
    query = supabase.table("saved_opportunities") \
        .select("*, opportunities(*)") \
        .eq("user_id", user_id)
    if status:
        query = query.eq("status", status)
    query = query.order("created_at", desc=True)
    result = query.execute()
    return result.data or []


def save_opportunity(user_id: str, opportunity_id: str, status: str = "reviewing"):
    result = supabase.table("saved_opportunities").upsert({
        "user_id": user_id,
        "opportunity_id": opportunity_id,
        "status": status,
    }, on_conflict="user_id,opportunity_id").execute()
    return result.data[0] if result.data else None


def update_saved_opportunity(user_id: str, opportunity_id: str, updates: dict):
    result = supabase.table("saved_opportunities") \
        .update(updates) \
        .eq("user_id", user_id) \
        .eq("opportunity_id", opportunity_id) \
        .execute()
    return result.data[0] if result.data else None


def delete_saved_opportunity(user_id: str, opportunity_id: str):
    supabase.table("saved_opportunities") \
        .delete() \
        .eq("user_id", user_id) \
        .eq("opportunity_id", opportunity_id) \
        .execute()


# ── Proposal Operations ──────────────────────────────────────────────

def get_proposals(user_id: str, status: str = None):
    query = supabase.table("proposals") \
        .select("*, opportunities(title, agency, naics_code)") \
        .eq("user_id", user_id)
    if status:
        query = query.eq("status", status)
    query = query.order("created_at", desc=True)
    result = query.execute()
    return result.data or []


def get_proposal(proposal_id: str, user_id: str = None):
    query = supabase.table("proposals") \
        .select("*, opportunities(*)") \
        .eq("id", proposal_id)
    if user_id:
        query = query.eq("user_id", user_id)
    result = query.execute()
    return result.data[0] if result.data else None


def create_proposal(data: dict):
    result = supabase.table("proposals").insert(data).execute()
    return result.data[0] if result.data else None


def update_proposal(proposal_id: str, updates: dict):
    result = supabase.table("proposals").update(updates).eq("id", proposal_id).execute()
    return result.data[0] if result.data else None


# ── AI Analysis Operations ────────────────────────────────────────────

def save_ai_analysis(data: dict):
    result = supabase.table("ai_analyses").insert(data).execute()
    return result.data[0] if result.data else None


def get_ai_analyses(opportunity_id: str, user_id: str, analysis_type: str = None):
    query = supabase.table("ai_analyses") \
        .select("*") \
        .eq("opportunity_id", opportunity_id) \
        .eq("user_id", user_id)
    if analysis_type:
        query = query.eq("analysis_type", analysis_type)
    query = query.order("created_at", desc=True)
    result = query.execute()
    return result.data or []


# ── Chat / Conversation Operations ────────────────────────────────────

def get_user_conversations(user_id: str):
    result = supabase.table("chat_sessions") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("updated_at", desc=True) \
        .execute()
    return result.data or []


def create_conversation(user_id: str, agent_type: str, title: str = "New conversation"):
    result = supabase.table("chat_sessions").insert({
        "user_id": user_id,
        "agent_type": agent_type,
        "title": title,
    }).execute()
    return result.data[0] if result.data else None


def save_message(session_id: str, role: str, content: str, metadata: dict = None):
    result = supabase.table("chat_messages").insert({
        "session_id": session_id,
        "role": role,
        "content": content,
        "metadata": metadata,
    }).execute()
    return result.data[0] if result.data else None


def get_conversation_messages(session_id: str, limit: int = 50):
    result = supabase.table("chat_messages") \
        .select("*") \
        .eq("session_id", session_id) \
        .order("created_at") \
        .limit(limit) \
        .execute()
    return result.data or []


def update_conversation(session_id: str, updates: dict):
    supabase.table("chat_sessions").update(updates).eq("id", session_id).execute()


# ── Notification Operations ───────────────────────────────────────────

def get_notifications(user_id: str, unread_only: bool = False, limit: int = 50):
    query = supabase.table("notifications") \
        .select("*") \
        .eq("user_id", user_id)
    if unread_only:
        query = query.eq("is_read", False)
    query = query.order("created_at", desc=True).limit(limit)
    result = query.execute()
    return result.data or []


def create_notification(data: dict):
    result = supabase.table("notifications").insert(data).execute()
    return result.data[0] if result.data else None


def mark_notification_read(notification_id: str):
    supabase.table("notifications") \
        .update({"is_read": True}) \
        .eq("id", notification_id) \
        .execute()


def mark_all_notifications_read(user_id: str):
    supabase.table("notifications") \
        .update({"is_read": True}) \
        .eq("user_id", user_id) \
        .eq("is_read", False) \
        .execute()


def get_unread_notification_count(user_id: str) -> int:
    result = supabase.table("notifications") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .eq("is_read", False) \
        .execute()
    return result.count or 0


# ── Certification Operations ─────────────────────────────────────────

def get_certifications(user_id: str):
    result = supabase.table("certification_documents") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()
    return result.data or []


def create_certification(data: dict):
    result = supabase.table("certification_documents").insert(data).execute()
    return result.data[0] if result.data else None


def update_certification(cert_id: str, updates: dict):
    result = supabase.table("certification_documents") \
        .update(updates) \
        .eq("id", cert_id) \
        .execute()
    return result.data[0] if result.data else None


# ── Contract History Operations ───────────────────────────────────────

def search_contracts(filters: dict, limit: int = 100, offset: int = 0):
    query = supabase.table("contracts_history").select("*")
    if filters.get("naics_code"):
        query = query.eq("naics_code", filters["naics_code"])
    if filters.get("agency"):
        query = query.ilike("agency", f"%{filters['agency']}%")
    if filters.get("vendor_name"):
        query = query.ilike("vendor_name", f"%{filters['vendor_name']}%")
    if filters.get("min_amount"):
        query = query.gte("award_amount", filters["min_amount"])
    if filters.get("max_amount"):
        query = query.lte("award_amount", filters["max_amount"])
    query = query.order("award_date", desc=True).range(offset, offset + limit - 1)
    result = query.execute()
    return result.data or []


def upsert_contract(data: dict):
    result = supabase.table("contracts_history").upsert(
        data, on_conflict="contract_id"
    ).execute()
    return result.data[0] if result.data else None


# ── Saved Searches ────────────────────────────────────────────────────

def get_saved_searches(user_id: str):
    result = supabase.table("saved_searches") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()
    return result.data or []


def create_saved_search(data: dict):
    result = supabase.table("saved_searches").insert(data).execute()
    return result.data[0] if result.data else None


# ── Analytics ─────────────────────────────────────────────────────────

def track_interaction(user_id: str, opportunity_id: str, interaction_type: str, metadata: dict = None):
    supabase.table("opportunity_interactions").insert({
        "user_id": user_id,
        "opportunity_id": opportunity_id,
        "interaction_type": interaction_type,
        "metadata": metadata or {},
    }).execute()


def track_analytics_event(user_id: str, event_type: str, event_data: dict = None):
    supabase.table("analytics_events").insert({
        "user_id": user_id,
        "event_type": event_type,
        "event_data": event_data or {},
    }).execute()
