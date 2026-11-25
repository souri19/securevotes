from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    position = Column(String(120), nullable=False)
    organization = Column(String(160), nullable=False)
    biography = Column(Text, nullable=False)
    manifesto = Column(Text, nullable=False)
    vision = Column(Text, nullable=False, default="")
    objectives_json = Column(Text, nullable=False, default="[]")
    accent_color = Column(String(20), nullable=False, default="#C8A96A")
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    election = relationship("Election", back_populates="candidates")
    demo_ballots = relationship("DemoBallot", back_populates="candidate", cascade="all, delete-orphan")
