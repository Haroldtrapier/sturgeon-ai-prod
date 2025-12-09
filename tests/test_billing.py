"""
Tests for billing routes and Stripe webhook handlers
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch, MagicMock
import json
from datetime import datetime

# Import app and dependencies
from backend.main import app
from backend.database import get_db
from backend.models import Base, User, Subscription
from backend.auth import get_current_user

# Create in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for tests"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_get_current_user():
    """Override auth dependency for tests"""
    return User(
        id=1,
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed",
        is_active=True
    )


# Override dependencies
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)


@pytest.fixture(scope="function")
def setup_database():
    """Setup test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(setup_database):
    """Get database session for tests"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db_session):
    """Create test user"""
    user = User(
        id=1,
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestCheckoutSession:
    """Tests for checkout session endpoint"""

    @patch('backend.routes.billing.stripe.checkout.Session.create')
    def test_create_checkout_session_basic(self, mock_stripe_create, test_user):
        """Test creating a checkout session for basic plan"""
        mock_stripe_create.return_value = Mock(url="https://checkout.stripe.com/test")
        
        response = client.post(
            "/api/billing/checkout-session?plan=basic",
            headers={"Authorization": "Bearer test-token"}
        )
        
        assert response.status_code == 200
        assert "checkout_url" in response.json()
        assert response.json()["checkout_url"] == "https://checkout.stripe.com/test"

    @patch('backend.routes.billing.stripe.checkout.Session.create')
    def test_create_checkout_session_pro(self, mock_stripe_create, test_user):
        """Test creating a checkout session for pro plan"""
        mock_stripe_create.return_value = Mock(url="https://checkout.stripe.com/test")
        
        response = client.post(
            "/api/billing/checkout-session?plan=pro",
            headers={"Authorization": "Bearer test-token"}
        )
        
        assert response.status_code == 200

    @patch('backend.routes.billing.stripe.checkout.Session.create')
    def test_create_checkout_session_enterprise(self, mock_stripe_create, test_user):
        """Test creating a checkout session for enterprise plan"""
        mock_stripe_create.return_value = Mock(url="https://checkout.stripe.com/test")
        
        response = client.post(
            "/api/billing/checkout-session?plan=enterprise",
            headers={"Authorization": "Bearer test-token"}
        )
        
        assert response.status_code == 200

    def test_create_checkout_session_invalid_plan(self, test_user):
        """Test creating a checkout session with invalid plan"""
        response = client.post(
            "/api/billing/checkout-session?plan=invalid",
            headers={"Authorization": "Bearer test-token"}
        )
        
        assert response.status_code == 400
        assert "Invalid plan" in response.json()["detail"]


class TestWebhookHandlers:
    """Tests for Stripe webhook handlers"""

    @patch('backend.routes.billing.stripe.Webhook.construct_event')
    def test_webhook_checkout_session_completed(self, mock_construct_event, test_user, db_session):
        """Test webhook handler for checkout.session.completed"""
        mock_event = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "customer_details": {"email": "test@example.com"},
                    "subscription": "sub_test123"
                }
            }
        }
        mock_construct_event.return_value = mock_event
        
        response = client.post(
            "/api/billing/webhook",
            headers={"stripe-signature": "test-signature"},
            content=b"test-payload"
        )
        
        assert response.status_code == 200
        assert response.json() == {"received": True}
        
        # Verify subscription was created/updated
        sub = db_session.query(Subscription).filter(
            Subscription.user_id == test_user.id
        ).first()
        assert sub is not None
        assert sub.stripe_subscription_id == "sub_test123"
        assert sub.status == "active"

    @patch('backend.routes.billing.stripe.Webhook.construct_event')
    def test_webhook_invoice_payment_failed(self, mock_construct_event, test_user, db_session):
        """Test webhook handler for invoice.payment_failed"""
        # Create existing subscription
        sub = Subscription(
            user_id=test_user.id,
            stripe_subscription_id="sub_test123",
            status="active"
        )
        db_session.add(sub)
        db_session.commit()
        
        mock_event = {
            "type": "invoice.payment_failed",
            "data": {
                "object": {
                    "subscription": "sub_test123"
                }
            }
        }
        mock_construct_event.return_value = mock_event
        
        response = client.post(
            "/api/billing/webhook",
            headers={"stripe-signature": "test-signature"},
            content=b"test-payload"
        )
        
        assert response.status_code == 200
        
        # Verify subscription status was updated
        db_session.refresh(sub)
        assert sub.status == "past_due"

    @patch('backend.routes.billing.stripe.Webhook.construct_event')
    def test_webhook_subscription_deleted(self, mock_construct_event, test_user, db_session):
        """Test webhook handler for customer.subscription.deleted"""
        # Create existing subscription
        sub = Subscription(
            user_id=test_user.id,
            stripe_subscription_id="sub_test123",
            status="active"
        )
        db_session.add(sub)
        db_session.commit()
        
        mock_event = {
            "type": "customer.subscription.deleted",
            "data": {
                "object": {
                    "id": "sub_test123"
                }
            }
        }
        mock_construct_event.return_value = mock_event
        
        response = client.post(
            "/api/billing/webhook",
            headers={"stripe-signature": "test-signature"},
            content=b"test-payload"
        )
        
        assert response.status_code == 200
        
        # Verify subscription status was updated
        db_session.refresh(sub)
        assert sub.status == "canceled"

    @patch('backend.routes.billing.stripe.Webhook.construct_event')
    def test_webhook_subscription_updated(self, mock_construct_event, test_user, db_session):
        """Test webhook handler for customer.subscription.updated"""
        # Create existing subscription
        sub = Subscription(
            user_id=test_user.id,
            stripe_subscription_id="sub_test123",
            status="active"
        )
        db_session.add(sub)
        db_session.commit()
        
        current_period_end_timestamp = 1735689600  # Some future timestamp
        
        mock_event = {
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "id": "sub_test123",
                    "status": "active",
                    "cancel_at_period_end": True,
                    "current_period_end": current_period_end_timestamp
                }
            }
        }
        mock_construct_event.return_value = mock_event
        
        response = client.post(
            "/api/billing/webhook",
            headers={"stripe-signature": "test-signature"},
            content=b"test-payload"
        )
        
        assert response.status_code == 200
        
        # Verify subscription was updated
        db_session.refresh(sub)
        assert sub.status == "active"
        assert sub.cancel_at_period_end is True
        assert sub.current_period_end is not None

    @patch('backend.routes.billing.stripe.Webhook.construct_event')
    def test_webhook_invalid_signature(self, mock_construct_event):
        """Test webhook with invalid signature"""
        mock_construct_event.side_effect = Exception("Invalid signature")
        
        response = client.post(
            "/api/billing/webhook",
            headers={"stripe-signature": "invalid-signature"},
            content=b"test-payload"
        )
        
        assert response.status_code == 400

    @patch('backend.routes.billing.stripe.Webhook.construct_event')
    def test_webhook_unknown_event_type(self, mock_construct_event, test_user):
        """Test webhook with unknown event type"""
        mock_event = {
            "type": "unknown.event.type",
            "data": {"object": {}}
        }
        mock_construct_event.return_value = mock_event
        
        response = client.post(
            "/api/billing/webhook",
            headers={"stripe-signature": "test-signature"},
            content=b"test-payload"
        )
        
        # Should still return success for unknown events
        assert response.status_code == 200
        assert response.json() == {"received": True}
