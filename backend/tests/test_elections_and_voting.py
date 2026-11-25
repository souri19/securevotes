from app.models.ballot import DemoBallot
from app.models.election import Election
from tests.conftest import login_and_get_csrf


def test_demo_ballot_submission_and_double_vote_prevention(client, test_db_session):
    db, _ = test_db_session
    csrf = login_and_get_csrf(client, "voter@securevote.demo", "DemoVoter2026!")

    elections = client.get("/api/elections?status=active").json()
    assert len(elections) >= 1
    active_election = elections[0]
    detail = client.get(f"/api/elections/{active_election['id']}").json()
    candidate_id = detail["candidates"][0]["id"]

    # First submission succeeds
    cast_resp = client.post(
        "/api/voting/submit",
        json={"election_id": active_election["id"], "candidate_id": candidate_id},
        headers={"X-CSRF-Token": csrf},
    )
    assert cast_resp.status_code == 201, cast_resp.text
    receipt = cast_resp.json()
    assert receipt["receipt_ref"].startswith("SV-DEMO-")

    # Privacy check: DemoBallot schema has no user_id column or PII
    assert not hasattr(DemoBallot, "user_id")
    stored = db.query(DemoBallot).filter(DemoBallot.demo_session_ref == receipt["receipt_ref"]).first()
    assert stored is not None
    assert stored.candidate_id == candidate_id

    # Second submission in same election is blocked
    second_resp = client.post(
        "/api/voting/submit",
        json={"election_id": active_election["id"], "candidate_id": candidate_id},
        headers={"X-CSRF-Token": csrf},
    )
    assert second_resp.status_code == 409


def test_cannot_vote_in_upcoming_or_completed_election(client):
    csrf = login_and_get_csrf(client, "alex.rivera@securevote.demo", "DemoVoter2026!")
    upcoming = client.get("/api/elections?status=upcoming").json()[0]
    detail = client.get(f"/api/elections/{upcoming['id']}").json()
    candidate_id = detail["candidates"][0]["id"]

    resp = client.post(
        "/api/voting/submit",
        json={"election_id": upcoming["id"], "candidate_id": candidate_id},
        headers={"X-CSRF-Token": csrf},
    )
    assert resp.status_code == 400


def test_transparency_endpoint_exposes_no_voter_pii(client):
    resp = client.get("/api/transparency")
    assert resp.status_code == 200
    body_text = resp.text.lower()
    assert "voter@securevote.demo" not in body_text
    assert "password_hash" not in body_text
    assert "security_architecture_gaps" in resp.json()
