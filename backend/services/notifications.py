"""
Notification system for user alerts and updates
"""
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, Index, Enum
from database import Base, SessionLocal
import enum


class NotificationType(str, enum.Enum):
    """Types of notifications"""
    OPPORTUNITY_MATCH = "opportunity_match"
    PROPOSAL_STATUS = "proposal_status"
    DEADLINE_REMINDER = "deadline_reminder"
    SYSTEM_ALERT = "system_alert"
    AI_INSIGHT = "ai_insight"


class NotificationPriority(str, enum.Enum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(Base):
    """User notification model"""
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notification_user_id", "user_id"),
        Index("ix_notification_created_at", "created_at"),
        Index("ix_notification_read", "is_read"),
    )
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    
    # Notification content
    type = Column(String(50), nullable=False)
    priority = Column(String(20), default=NotificationPriority.MEDIUM.value)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Optional action
    action_url = Column(String(500), nullable=True)
    action_label = Column(String(100), nullable=True)
    
    # Metadata
    metadata = Column(Text, nullable=True)  # JSON string
    
    # Status
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)


class NotificationService:
    """Service for managing notifications"""
    
    def __init__(self):
        pass
    
    def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.SYSTEM_ALERT,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        action_url: Optional[str] = None,
        action_label: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        db_session = None
    ) -> Notification:
        """Create a new notification"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            import json
            
            notification = Notification(
                user_id=user_id,
                type=notification_type.value,
                priority=priority.value,
                title=title,
                message=message,
                action_url=action_url,
                action_label=action_label,
                metadata=json.dumps(metadata) if metadata else None
            )
            
            db_session.add(notification)
            db_session.commit()
            db_session.refresh(notification)
            
            print(f"[Notifications] Created {priority.value} notification for user {user_id}")
            return notification
            
        finally:
            if should_close:
                db_session.close()
    
    def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50,
        db_session = None
    ) -> List[Notification]:
        """Get notifications for a user"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            query = db_session.query(Notification).filter(
                Notification.user_id == user_id
            )
            
            if unread_only:
                query = query.filter(Notification.is_read == False)
            
            # Filter expired notifications
            query = query.filter(
                (Notification.expires_at == None) | 
                (Notification.expires_at > datetime.utcnow())
            )
            
            notifications = query.order_by(
                Notification.created_at.desc()
            ).limit(limit).all()
            
            return notifications
            
        finally:
            if should_close:
                db_session.close()
    
    def mark_as_read(
        self,
        notification_id: str,
        db_session = None
    ) -> bool:
        """Mark notification as read"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            notification = db_session.query(Notification).filter(
                Notification.id == notification_id
            ).first()
            
            if notification:
                notification.is_read = True
                notification.read_at = datetime.utcnow()
                db_session.commit()
                return True
            
            return False
            
        finally:
            if should_close:
                db_session.close()
    
    def mark_all_as_read(
        self,
        user_id: str,
        db_session = None
    ) -> int:
        """Mark all user notifications as read"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            count = db_session.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.is_read == False
            ).update({
                "is_read": True,
                "read_at": datetime.utcnow()
            })
            
            db_session.commit()
            return count
            
        finally:
            if should_close:
                db_session.close()
    
    def get_unread_count(
        self,
        user_id: str,
        db_session = None
    ) -> int:
        """Get count of unread notifications"""
        should_close = db_session is None
        if db_session is None:
            db_session = SessionLocal()
        
        try:
            count = db_session.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.is_read == False
            ).count()
            
            return count
            
        finally:
            if should_close:
                db_session.close()
    
    # Convenience methods for specific notification types
    
    def notify_opportunity_match(
        self,
        user_id: str,
        opportunity_title: str,
        match_score: float,
        opportunity_id: str,
        db_session = None
    ):
        """Notify user of a matched opportunity"""
        return self.create_notification(
            user_id=user_id,
            title="🎯 New Opportunity Match!",
            message=f"We found a {int(match_score * 100)}% match: {opportunity_title}",
            notification_type=NotificationType.OPPORTUNITY_MATCH,
            priority=NotificationPriority.HIGH,
            action_url=f"/opportunities/{opportunity_id}",
            action_label="View Opportunity",
            metadata={"opportunity_id": opportunity_id, "match_score": match_score},
            db_session=db_session
        )
    
    def notify_deadline_reminder(
        self,
        user_id: str,
        proposal_name: str,
        deadline: datetime,
        proposal_id: str,
        db_session = None
    ):
        """Notify user of upcoming deadline"""
        days_until = (deadline - datetime.utcnow()).days
        
        return self.create_notification(
            user_id=user_id,
            title="⏰ Proposal Deadline Approaching",
            message=f"{proposal_name} is due in {days_until} days",
            notification_type=NotificationType.DEADLINE_REMINDER,
            priority=NotificationPriority.URGENT if days_until <= 2 else NotificationPriority.HIGH,
            action_url=f"/proposals/{proposal_id}",
            action_label="View Proposal",
            metadata={"proposal_id": proposal_id, "deadline": deadline.isoformat()},
            db_session=db_session
        )
    
    def notify_proposal_status_change(
        self,
        user_id: str,
        proposal_name: str,
        old_status: str,
        new_status: str,
        proposal_id: str,
        db_session = None
    ):
        """Notify user of proposal status change"""
        return self.create_notification(
            user_id=user_id,
            title="📄 Proposal Status Updated",
            message=f"{proposal_name} status changed from {old_status} to {new_status}",
            notification_type=NotificationType.PROPOSAL_STATUS,
            priority=NotificationPriority.MEDIUM,
            action_url=f"/proposals/{proposal_id}",
            action_label="View Proposal",
            metadata={"proposal_id": proposal_id, "old_status": old_status, "new_status": new_status},
            db_session=db_session
        )


# Global instance
notification_service = NotificationService()
