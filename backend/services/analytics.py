"""
Analytics backend service
Track user activity and generate insights via Supabase
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

try:
    from services.db import supabase
except ImportError:
    from backend.services.db import supabase


class AnalyticsService:
    """Generate analytics and insights for users"""

    def get_user_analytics(self, user_id: str, time_range: str = "30d") -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user via Supabase.
        """
        cutoff_date = self._get_cutoff_date(time_range)

        # Query proposals
        query = supabase.table("proposals").select("*").eq("user_id", user_id)
        if cutoff_date:
            query = query.gte("created_at", cutoff_date.isoformat())
        proposals = query.execute().data or []

        total_proposals = len(proposals)
        active = len([p for p in proposals if p.get("status") == "draft"])
        submitted = len([p for p in proposals if p.get("status") == "submitted"])
        awarded = len([p for p in proposals if p.get("status") == "awarded"])
        in_review = len([p for p in proposals if p.get("status") == "in_review"])
        ready = len([p for p in proposals if p.get("status") == "ready"])
        rejected = len([p for p in proposals if p.get("status") == "rejected"])

        success_rate = (awarded / submitted * 100) if submitted > 0 else 0

        # Count saved opportunities
        saved_opps = supabase.table("saved_opportunities").select("id", count="exact").eq("user_id", user_id).execute()
        saved_count = saved_opps.count if saved_opps.count is not None else len(saved_opps.data or [])

        # Count analytics events (opportunities viewed)
        viewed_query = supabase.table("analytics_events").select("id", count="exact").eq("user_id", user_id).eq("event_type", "opportunity_viewed")
        if cutoff_date:
            viewed_query = viewed_query.gte("created_at", cutoff_date.isoformat())
        viewed = viewed_query.execute()
        viewed_count = viewed.count if viewed.count is not None else len(viewed.data or [])

        # Recent activity
        recent_activity = self._get_recent_activity(user_id)

        return {
            "totalProposals": total_proposals,
            "activeProposals": active,
            "submittedProposals": submitted,
            "successRate": round(success_rate, 1),
            "opportunitiesViewed": viewed_count,
            "savedOpportunities": saved_count,
            "avgResponseTime": 0,
            "recentActivity": recent_activity,
            "timeRange": time_range,
            "breakdown": {
                "draft": active,
                "in_review": in_review,
                "ready": ready,
                "submitted": submitted,
                "awarded": awarded,
                "rejected": rejected,
            }
        }

    def _get_cutoff_date(self, time_range: str) -> Optional[datetime]:
        if time_range == "all":
            return None
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(time_range, 30)
        return datetime.now() - timedelta(days=days)

    def _get_recent_activity(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        proposals = (
            supabase.table("proposals")
            .select("id, title, status, updated_at")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .limit(limit)
            .execute()
            .data or []
        )
        activity = []
        for p in proposals:
            activity.append({
                "id": p.get("id"),
                "type": "proposal",
                "description": f"Updated proposal: {p.get('title', 'Untitled')}",
                "timestamp": p.get("updated_at", datetime.now().isoformat())
            })
        return activity

    def get_platform_analytics(self) -> Dict[str, Any]:
        """Get platform-wide analytics (admin only)"""
        # Total proposals
        all_proposals = supabase.table("proposals").select("id, status, user_id, created_at").execute().data or []
        total = len(all_proposals)

        status_counts = {}
        for p in all_proposals:
            s = p.get("status", "unknown")
            status_counts[s] = status_counts.get(s, 0) + 1

        # Active users (last 30 days)
        cutoff = (datetime.now() - timedelta(days=30)).isoformat()
        recent = [p for p in all_proposals if (p.get("created_at") or "") >= cutoff]
        active_users = len(set(p.get("user_id") for p in recent if p.get("user_id")))

        return {
            "totalProposals": total,
            "activeUsers": active_users,
            "statusBreakdown": status_counts,
            "generatedAt": datetime.now().isoformat()
        }


# Global instance
analytics_service = AnalyticsService()
