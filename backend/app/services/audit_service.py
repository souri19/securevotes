import json
from typing import Any, Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.audit import ElectionAuditEvent
from app.models.ballot import DemoBallot
from app.models.election import Election
from app.schemas.audit import AuditEventOut, TransparencySummaryOut

SECURITY_ARCHITECTURE_GAPS = [
    "End-to-end cryptographic verifiability (e.g., Benaloh challenges, zero-knowledge ballot proofs, and public bulletin boards) is not implemented in this prototype.",
    "True coercion-resistant / receipt-free anonymity requires cryptographic mix-nets or homomorphic tallying rather than application-layer table separation.",
    "Production deployment requires independent third-party security audits, formal threat modeling, HSM-backed key custody, and verifiable reproducible builds.",
    "Voter identity proofing in real elections requires external authoritative identity verification and strict air-gapped or multi-party quorum administrative controls.",
]


def record_audit_event(
    db: Session,
    event_type: str,
    election_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> ElectionAuditEvent:
    safe_metadata = metadata or {}
    event = ElectionAuditEvent(
        event_type=event_type,
        election_id=election_id,
        event_metadata=json.dumps(safe_metadata),
    )
    db.add(event)
    db.flush()
    return event


def list_audit_events(
    db: Session,
    limit: int = 100,
    event_type: Optional[str] = None,
    election_id: Optional[int] = None,
) -> List[AuditEventOut]:
    query = db.query(ElectionAuditEvent)
    if event_type:
        query = query.filter(ElectionAuditEvent.event_type == event_type)
    if election_id is not None:
        query = query.filter(ElectionAuditEvent.election_id == election_id)

    events = (
        query.order_by(ElectionAuditEvent.timestamp.desc(), ElectionAuditEvent.id.desc())
        .limit(limit)
        .all()
    )

    election_titles = {
        eid: title for eid, title in db.query(Election.id, Election.title).all()
    }

    results: List[AuditEventOut] = []
    for ev in events:
        try:
            parsed_meta = json.loads(ev.event_metadata or "{}")
        except json.JSONDecodeError:
            parsed_meta = {}
        results.append(
            AuditEventOut(
                id=ev.id,
                event_type=ev.event_type,
                election_id=ev.election_id,
                election_title=election_titles.get(ev.election_id) if ev.election_id else None,
                timestamp=ev.timestamp,
                metadata=parsed_meta,
            )
        )
    return results


def get_transparency_summary(db: Session) -> TransparencySummaryOut:
    total_events = db.query(func.count(ElectionAuditEvent.id)).scalar() or 0
    elections_published = (
        db.query(func.count(Election.id))
        .filter(Election.status.in_(["active", "completed"]))
        .scalar()
        or 0
    )
    total_participation = db.query(func.count(DemoBallot.id)).scalar() or 0
    recent = list_audit_events(db, limit=40)

    return TransparencySummaryOut(
        prototype_disclaimer=(
            "Prototype Transparency Notice: All records below represent simulated election "
            "events generated inside this demonstration environment. No real voter PII, "
            "individual ballot choices, or credentials are exposed."
        ),
        security_architecture_gaps=SECURITY_ARCHITECTURE_GAPS,
        total_audit_events=total_events,
        elections_published=elections_published,
        total_simulated_participation=total_participation,
        recent_events=recent,
    )
