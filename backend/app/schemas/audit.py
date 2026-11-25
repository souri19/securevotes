from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AuditEventOut(BaseModel):
    id: int
    event_type: str
    election_id: Optional[int]
    election_title: Optional[str] = None
    timestamp: datetime
    metadata: Dict[str, Any]


class TransparencySummaryOut(BaseModel):
    prototype_disclaimer: str
    security_architecture_gaps: List[str]
    total_audit_events: int
    elections_published: int
    total_simulated_participation: int
    recent_events: List[AuditEventOut]
