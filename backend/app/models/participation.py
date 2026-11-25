from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Index
from sqlalchemy.orm import relationship

from app.database import Base


class ElectionParticipation(Base):
    __tablename__ = "election_participation"

    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    participation_count = Column(Integer, nullable=False, default=0)
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    election = relationship("Election", back_populates="participation_records")

    __table_args__ = (
        Index("ix_participation_election_time", "election_id", "timestamp"),
    )
