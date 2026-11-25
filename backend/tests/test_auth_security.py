from app.config import get_settings
from app.models.user import User
from tests.conftest import login_and_get_csrf


def test_password_is_hashed_with_argon2(test_db_session):
    db, _ = test_db_session
    user = db.query(User).filter(User.email == "voter@securevote.demo").first()
    assert user is not None
    assert user.password_hash.startswith("$argon2")
    assert "DemoVoter2026!" not in user.password_hash


def test_unauthenticated_access_blocked(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/profile/participation").status_code == 401
    assert client.get("/api/admin/overview").status_code in (401, 403)


def test_security_headers_present(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"


def test_register_always_creates_voter_and_sets_cookies(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "name": "Jordan Blake",
            "email": "jordan.blake@example.com",
            "voter_id": "vid-2026-8801",
            "password": "StrongDemoPassword!1",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["role"] == "voter"
    assert data["user"]["voter_id"] == "VID-2026-8801"
    assert data["csrf_token"]
    assert "securevote_session" in resp.cookies

    # Duplicate Voter ID is rejected
    dup = client.post(
        "/api/auth/register",
        json={
            "name": "Another User",
            "email": "other@example.com",
            "voter_id": "VID-2026-8801",
            "password": "StrongDemoPassword!1",
        },
    )
    assert dup.status_code == 409


def test_login_with_voter_id_succeeds(client):
    resp = client.post(
        "/api/auth/login",
        json={"identifier": "VID-2026-1001", "password": "DemoVoter2026!"},
    )
    assert resp.status_code == 200
    assert resp.json()["user"]["email"] == "voter@securevote.demo"


def test_csrf_protection_blocks_mutating_requests_without_header(client):
    csrf = login_and_get_csrf(client, "voter@securevote.demo", "DemoVoter2026!")

    # Missing X-CSRF-Token header must fail with 403
    bad_resp = client.patch("/api/profile", json={"name": "Tampered Name"})
    assert bad_resp.status_code == 403

    # Valid X-CSRF-Token succeeds
    good_resp = client.patch(
        "/api/profile",
        json={"name": "Maya Lin Updated"},
        headers={"X-CSRF-Token": csrf},
    )
    assert good_resp.status_code == 200
    assert good_resp.json()["name"] == "Maya Lin Updated"


def test_logout_revokes_session(client):
    csrf = login_and_get_csrf(client, "voter@securevote.demo", "DemoVoter2026!")
    assert client.get("/api/auth/me").status_code == 200

    logout_resp = client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf})
    assert logout_resp.status_code == 200

    assert client.get("/api/auth/me").status_code == 401


def test_login_rate_limiting(client):
    settings = get_settings()
    limit = settings.AUTH_RATE_LIMIT_MAX_REQUESTS
    for _ in range(limit):
        resp = client.post(
            "/api/auth/login",
            json={"email": "voter@securevote.demo", "password": "wrong-password"},
        )
        assert resp.status_code == 401

    throttled = client.post(
        "/api/auth/login",
        json={"email": "voter@securevote.demo", "password": "wrong-password"},
    )
    assert throttled.status_code == 429
