"""
Analytics backend service
Track user activity and generate insights
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from sqlalchemy import func
from database import SessionLocal
from models.proposal import Proposal, ProposalStatus


class AnalyticsService:
    """Generate analytics and insights for users"""
    
    def __init__(self):
        pass
    
    def get_user_analytics(
        self,
        user_id: str,
        time_range: str = "30d",
        db_session = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user
        
        Args:
            user_id: User ID
            time_range: One of: 7d, 30d, 90d, all
        """
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            # Calculate date range
            cutoff_date = self._get_cutoff_date(time_range)
            
            # Query proposals
            proposals_query = db_session.query(Proposal).filter(
                Proposal.user_id == user_id
            )
            
            if cutoff_date:
                proposals_query = proposals_query.filter(
                    Proposal.created_at >= cutoff_date
                )
            
            all_proposals = proposals_query.all()
            
            # Calculate metrics
            total_proposals = len(all_proposals)
            active_proposals = len([p for p in all_proposals if p.status == ProposalStatus.DRAFT.value])
            submitted_proposals = len([p for p in all_proposals if p.status == ProposalStatus.SUBMITTED.value])
            awarded_proposals = len([p for p in all_proposals if p.status == ProposalStatus.AWARDED.value])
            
            success_rate = (awarded_proposals / submitted_proposals * 100) if submitted_proposals > 0 else 0
            
            # Calculate average response time (mock for now)
            avg_response_time = self._calculate_avg_response_time(all_proposals)
            
            # Recent activity
            recent_activity = self._get_recent_activity(user_id, limit=10, db_session=db_session)
            
            return {
                "totalProposals": total_proposals,
                "activeProposals": active_proposals,
                "submittedProposals": submitted_proposals,
                "successRate": round(success_rate, 1),
                "opportunitiesViewed": 0,  # TODO: Track this
                "savedOpportunities": 0,  # TODO: Track this
                "avgResponseTime": avg_response_time,
                "recentActivity": recent_activity,
                "timeRange": time_range,
                "breakdown": {
                    "draft": active_proposals,
                    "in_review": len([p for p in all_proposals if p.status == ProposalStatus.IN_REVIEW.value]),
                    "ready": len([p for p in all_proposals if p.status == ProposalStatus.READY.value]),
                    "submitted": submitted_proposals,
                    "awarded": awarded_proposals,
                    "rejected": len([p for p in all_proposals if p.status == ProposalStatus.REJECTED.value]),
                }
            }
            
        finally:
            if should_close:
                db_session.close()
    
    def _get_cutoff_date(self, time_range: str) -> Optional[datetime]:
        """Calculate cutoff date based on time range"""
        if time_range == "all":
            return None
        
        days_map = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
        }
        
        days = days_map.get(time_range, 30)
        return datetime.now() - timedelta(days=days)
    
    def _calculate_avg_response_time(self, proposals: List[Proposal]) -> int:
        """Calculate average response time in hours"""
        if not proposals:
            return 0
        
        total_hours = 0
        count = 0
        
        for proposal in proposals:
            if proposal.submitted_at and proposal.created_at:
                delta = proposal.submitted_at - proposal.created_at
                total_hours += delta.total_seconds() / 3600
                count += 1
        
        return int(total_hours / count) if count > 0 else 0
    
    def _get_recent_activity(
        self,
        user_id: str,
        limit: int = 10,
        db_session = None
    ) -> List[Dict[str, Any]]:
        """Get recent user activity"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            proposals = db_session.query(Proposal).filter(
                Proposal.user_id == user_id
            ).order_by(
                Proposal.updated_at.desc()
            ).limit(limit).all()
            
            activity = []
            for proposal in proposals:
                activity.append({
                    "id": proposal.id,
                    "type": "proposal",
                    "description": f"Updated proposal: {proposal.name}",
                    "timestamp": proposal.updated_at.isoformat() if proposal.updated_at else datetime.now().isoformat()
                })
            
            return activity
            
        finally:
            if should_close:
                db_session.close()
    
    def get_platform_analytics(self, db_session = None) -> Dict[str, Any]:
        """Get platform-wide analytics (admin only)"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            total_proposals = db_session.query(func.count(Proposal.id)).scalar()
            
            # Count by status
            status_counts = {}
            for status in ProposalStatus:
                count = db_session.query(func.count(Proposal.id)).filter(
                    Proposal.status == status.value
                ).scalar()
                status_counts[status.value] = count
            
            # Active users (users with proposals in last 30 days)
            cutoff = datetime.now() - timedelta(days=30)
            active_users = db_session.query(func.count(func.distinct(Proposal.user_id))).filter(
                Proposal.created_at >= cutoff
            ).scalar()
            
            return {
                "totalProposals": total_proposals or 0,
                "activeUsers": active_users or 0,
                "statusBreakdown": status_counts,
                "generatedAt": datetime.now().isoformat()
            }
            
        finally:
            if should_close:
                db_session.close()


# Global instance
analytics_service = AnalyticsService()
