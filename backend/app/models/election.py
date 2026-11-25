from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, Text, Index
from sqlalchemy.orm import relationship

from app.database import Base


class Election(Base):
    __tablename__ = "elections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    election_type = Column(String(80), nullable=False, default="Civic Council")
    eligibility_note = Column(String(300), nullable=False, default="All registered demo voters")
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(
        String(30),
        nullable=False,
        default="upcoming",
        index=True,
    )  # "draft" | "upcoming" | "active" | "completed" | "archived"
    eligible_voter_count = Column(Integer, nullable=False, default=500)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    candidates = relationship("Candidate", back_populates="election", cascade="all, delete-orphan")
    demo_ballots = relationship("DemoBallot", back_populates="election", cascade="all, delete-orphan")
    audit_events = relationship("ElectionAuditEvent", back_populates="election", cascade="all, delete-orphan")
    participation_records = relationship(
        "ElectionParticipation", back_populates="election", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_elections_status_dates", "status", "start_time", "end_time"),
    )
