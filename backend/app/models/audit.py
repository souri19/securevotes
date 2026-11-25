from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import relationship

from app.database import Base


class ElectionAuditEvent(Base):
    """
    Stores non-sensitive audit event summaries for transparency and admin review.
    Never stores voter identity alongside ballot choices, credentials, or secrets.
    """
    __tablename__ = "election_audit_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(80), nullable=False, index=True)
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    event_metadata = Column(Text, nullable=False, default="{}")

    election = relationship("Election", back_populates="audit_events")

    __table_args__ = (
        Index("ix_audit_events_type_time", "event_type", "timestamp"),
    )
