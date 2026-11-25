from datetime import datetime, timedelta, timezone
from tests.conftest import login_and_get_csrf


def test_voter_cannot_access_admin_endpoints(client):
    csrf = login_and_get_csrf(client, "voter@securevote.demo", "DemoVoter2026!")

    assert client.get("/api/admin/overview").status_code == 403
    assert client.get("/api/admin/users").status_code == 403
    assert client.get("/api/admin/logs").status_code == 403

    create_resp = client.post(
        "/api/admin/elections",
        json={
            "title": "Unauthorized Test Election",
            "description": "Should be blocked by RBAC.",
            "election_type": "Test",
            "start_time": datetime.now(timezone.utc).isoformat(),
            "end_time": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
            "status": "upcoming",
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert create_resp.status_code == 403


def test_admin_can_manage_elections_and_candidates(client):
    csrf = login_and_get_csrf(client, "admin@securevote.demo", "DemoAdmin2026!")

    now = datetime.now(timezone.utc)
    create_resp = client.post(
        "/api/admin/elections",
        json={
            "title": "2026 Civic Hackathon Jury Choice",
            "description": "Simulated demonstration election created via admin API.",
            "election_type": "Demo Advisory",
            "eligibility_note": "All demo accounts",
            "start_time": now.isoformat(),
            "end_time": (now + timedelta(days=3)).isoformat(),
            "status": "draft",
            "eligible_voter_count": 150,
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert create_resp.status_code == 201, create_resp.text
    election_id = create_resp.json()["id"]

    # Draft election is hidden from public listing
    public_ids = [e["id"] for e in client.get("/api/elections").json()]
    assert election_id not in public_ids

    # Admin activates the election
    status_resp = client.patch(
        f"/api/admin/elections/{election_id}/status",
        json={"status": "active"},
        headers={"X-CSRF-Token": csrf},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "active"

    # Admin adds a candidate
    cand_resp = client.post(
        "/api/admin/candidates",
        json={
            "name": "Elena Park",
            "position": "Jury Lead",
            "organization": "Open Civic Lab",
            "biography": "Civic designer and software engineer.",
            "manifesto": "Build transparent public-interest interfaces.",
            "vision": "Accessible technology for every community.",
            "objectives": ["Open documentation", "Accessible UI"],
            "accent_color": "#C8A96A",
            "election_id": election_id,
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert cand_resp.status_code == 201
    cand_id = cand_resp.json()["id"]

    # Admin deletes candidate and election cleanly
    assert (
        client.delete(
            f"/api/admin/candidates/{cand_id}",
            headers={"X-CSRF-Token": csrf},
        ).status_code
        == 204
    )
    assert (
        client.delete(
            f"/api/admin/elections/{election_id}",
            headers={"X-CSRF-Token": csrf},
        ).status_code
        == 204
    )
