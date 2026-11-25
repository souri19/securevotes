from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, Index
from sqlalchemy.orm import relationship

from app.database import Base


class DemoBallot(Base):
    """
    Stores simulated ballot selections.
    Privacy architecture note: Intentionally contains NO user_id, email, or PII.
    `demo_session_ref` is an unlinkable random demo receipt identifier.
    """
    __tablename__ = "demo_ballots"

    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    submission_timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    demo_session_ref = Column(String(64), nullable=False, unique=True, index=True)

    election = relationship("Election", back_populates="demo_ballots")
    candidate = relationship("Candidate", back_populates="demo_ballots")

    __table_args__ = (
        Index("ix_demo_ballots_election_candidate", "election_id", "candidate_id"),
    )


class VoterParticipationLock(Base):
    """
    Records only that a demo user participated in a given election to prevent
    repeated demo submissions within the prototype, without storing any
    reference to DemoBallot or candidate choice.
    """
    __tablename__ = "voter_participation_locks"

    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    participated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("election_id", "user_id", name="uq_voter_election_participation"),
    )
