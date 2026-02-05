import os
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
)

def get_user_profile(user_id: str):
    """Get user profile from database"""
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None

def create_user_profile(user_id: str, email: str):
    """Create user profile after signup"""
    result = supabase.table("users").insert({
        "id": user_id,
        "email": email,
        "plan": "free"
    }).execute()
    return result.data[0] if result.data else None

def get_user_conversations(user_id: str):
    """Get all conversations for a user"""
    result = supabase.table("conversations").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return result.data

def create_conversation(user_id: str, title: str = "New conversation"):
    """Create a new conversation"""
    result = supabase.table("conversations").insert({
        "user_id": user_id,
        "title": title
    }).execute()
    return result.data[0] if result.data else None

def save_message(conversation_id: str, role: str, agent: str, content: str):
    """Save a message to the database"""
    result = supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "agent": agent,
        "content": content
    }).execute()
    return result.data[0] if result.data else None

def get_conversation_messages(conversation_id: str):
    """Get all messages in a conversation"""
    result = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
    return result.data
