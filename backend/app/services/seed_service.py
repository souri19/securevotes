import json
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.audit import ElectionAuditEvent
from app.models.ballot import DemoBallot
from app.models.candidate import Candidate
from app.models.election import Election
from app.models.participation import ElectionParticipation
from app.models.user import User
from app.utils.security import hash_password


def seed_demo_data(db: Session) -> None:
    """Populate realistic simulated elections, candidates, and demo accounts if empty."""
    if db.query(User).first() is not None:
        return

    now = datetime.now(timezone.utc)

    # 1. Demo Users
    voter_maya = User(
        name="Maya Lin",
        email="voter@securevote.demo",
        voter_id="VID-2026-1001",
        password_hash=hash_password("DemoVoter2026!"),
        role="voter",
        status="active",
        created_at=now - timedelta(days=28),
    )
    voter_alex = User(
        name="Alex Rivera",
        email="alex.rivera@securevote.demo",
        voter_id="VID-2026-1002",
        password_hash=hash_password("DemoVoter2026!"),
        role="voter",
        status="active",
        created_at=now - timedelta(days=19),
    )
    admin_elena = User(
        name="Elena Vance",
        email="admin@securevote.demo",
        voter_id="ADM-2026-0001",
        password_hash=hash_password("DemoAdmin2026!"),
        role="admin",
        status="active",
        created_at=now - timedelta(days=45),
    )
    db.add_all([voter_maya, voter_alex, admin_elena])
    db.flush()

    # 2. Elections
    e1 = Election(
        title="Metro Civic Innovation Council — 2026 General Seat",
        description=(
            "Simulated municipal governance election selecting the Lead Commissioner for Civic "
            "Technology, Open Public Data, and Accessible Municipal Services for the 2026–2028 term."
        ),
        election_type="Civic Council",
        eligibility_note="All registered demo civic voters in District 1–9 (Simulated).",
        start_time=now - timedelta(days=2),
        end_time=now + timedelta(days=4),
        status="active",
        eligible_voter_count=420,
        created_at=now - timedelta(days=14),
    )
    e2 = Election(
        title="Open Campus Sustainability & Transit Initiative",
        description=(
            "Simulated institutional referendum determining the primary strategic slate for "
            "zero-emission campus mobility, micro-grid resilience, and open research commons."
        ),
        election_type="Institutional Governance",
        eligibility_note="Registered demo campus & community members (Simulated).",
        start_time=now - timedelta(days=1),
        end_time=now + timedelta(days=6),
        status="active",
        eligible_voter_count=310,
        created_at=now - timedelta(days=10),
    )
    e3 = Election(
        title="Regional Digital Infrastructure Advisory Board",
        description=(
            "Upcoming simulated selection for three-year community oversight seats governing "
            "municipal fiber expansion, rural broadband equity, and public privacy standards."
        ),
        election_type="Public Advisory",
        eligibility_note="Open to all active demo accounts once polls open.",
        start_time=now + timedelta(days=5),
        end_time=now + timedelta(days=15),
        status="upcoming",
        eligible_voter_count=550,
        created_at=now - timedelta(days=5),
    )
    e4 = Election(
        title="2025 Community Participatory Budget Allocation",
        description=(
            "Completed simulated participatory budget ballot deciding the primary public capital "
            "allocation across neighborhood libraries, urban canopy restoration, and transit shelters."
        ),
        election_type="Participatory Budget",
        eligibility_note="Completed simulation cycle — archive & results open for inspection.",
        start_time=now - timedelta(days=40),
        end_time=now - timedelta(days=26),
        status="completed",
        eligible_voter_count=480,
        created_at=now - timedelta(days=50),
    )
    e5 = Election(
        title="Civic Data Standards Oversight Committee",
        description=(
            "Completed simulated technical governance vote establishing municipal API openness "
            "benchmarks and quarterly public reporting requirements."
        ),
        election_type="Technical Governance",
        eligibility_note="Completed simulation cycle — certified demo tally published.",
        start_time=now - timedelta(days=22),
        end_time=now - timedelta(days=12),
        status="completed",
        eligible_voter_count=260,
        created_at=now - timedelta(days=30),
    )
    db.add_all([e1, e2, e3, e4, e5])
    db.flush()

    # 3. Candidates
    candidates_data = [
        # Election 1 (Active)
        (
            e1,
            "Dr. Nadia Okafor",
            "Lead Commissioner Candidate",
            "Civic Commons Coalition",
            "Former Director of Municipal Open Data with 14 years leading public-interest digital transformation and accessible service design.",
            "Public digital infrastructure should operate with the reliability of a public utility and the clarity of great editorial design. We will eliminate opaque vendor lock-in and publish plain-language service audits every quarter.",
            "A city where every resident can navigate public services in under three minutes, regardless of device or language.",
            [
                "Launch unified multilingual civic service portal within 180 days",
                "Mandate open-source licensing for all city-funded civic software",
                "Establish quarterly citizen usability testing panels",
            ],
            "#C8A96A",
            94,
        ),
        (
            e1,
            "Julian Mercer",
            "Lead Commissioner Candidate",
            "Metropolitan Reform Alliance",
            "Urban systems engineer and neighborhood budget chair focused on transit telemetry, procurement transparency, and reliable municipal operations.",
            "Modern governance succeeds when measurement precedes mandate. My platform pairs real-time public works tracking with streamlined civic feedback loops so neighborhoods see exact timelines and cost accountability.",
            "Measurable, accountable public operations powered by transparent civic engineering.",
            [
                "Publish live neighborhood infrastructure delivery dashboards",
                "Cut small-business municipal permitting wait times by 45%",
                "Create a public procurement plain-ledger review board",
            ],
            "#D96C53",
            78,
        ),
        (
            e1,
            "Sora Takahashi",
            "Lead Commissioner Candidate",
            "Independent Civic Technologists",
            "Accessibility researcher and privacy architect specializing in assistive web standards and low-bandwidth civic tools.",
            "Technology that excludes seniors, rural residents, or screen-reader users is broken infrastructure. Every municipal platform must pass independent accessibility verification before launch.",
            "Universal civic access built on privacy-respecting defaults and offline resilience.",
            [
                "Enforce WCAG AA compliance across all public web properties",
                "Deploy neighborhood civic kiosks with assistive hardware",
                "Adopt strict data-minimization rules for municipal forms",
            ],
            "#222222",
            63,
        ),
        (
            e1,
            "Marcus Alverez",
            "Lead Commissioner Candidate",
            "Neighborhood Grid Network",
            "Community organizer and broadband cooperative founder who built three municipal mesh networks across underserved districts.",
            "Before we build smarter apps, we must close the connectivity gap. I will prioritize public fiber, community Wi-Fi trusts, and digital literacy fellowships.",
            "Equitable connectivity as the bedrock of modern democratic participation.",
            [
                "Expand municipal dark-fiber access to 18 community centers",
                "Fund 50 paid neighborhood digital navigator fellowships",
                "Guarantee zero-rated access to essential civic portals",
            ],
            "#8A795D",
            41,
        ),
        # Election 2 (Active)
        (
            e2,
            "Green Corridor & Electric Shuttle Slate",
            "Primary Strategic Initiative",
            "Sustainable Mobility Working Group",
            "Joint faculty-student coalition proposing zero-emission autonomous shuttles and solar-shaded pedestrian corridors.",
            "Reallocate 60% of capital reserve to high-frequency electric loop shuttles, protected bike lanes, and real-time arrival displays across all transit stops.",
            "Carbon-neutral daily transit within five academic terms.",
            [
                "Replace remaining diesel loop buses with electric shuttles",
                "Install 4.2 km of weather-protected cycling paths",
                "Publish monthly energy-per-rider telemetry",
            ],
            "#C8A96A",
            72,
        ),
        (
            e2,
            "Micro-Grid & Building Retrofit Slate",
            "Primary Strategic Initiative",
            "Campus Resilience Lab",
            "Engineering and facilities coalition prioritizing battery storage, heat-pump retrofits, and peak-load solar generation.",
            "Focus investment on deep building efficiency and micro-grid resilience so critical research labs and student housing remain powered during grid stress events.",
            "Self-healing clean energy infrastructure across core facilities.",
            [
                "Retrofit 12 legacy halls with smart heat-pump HVAC",
                "Deploy 3 MWh community battery storage bank",
                "Open live campus energy telemetry to student researchers",
            ],
            "#D96C53",
            58,
        ),
        (
            e2,
            "Open Research & Circular Commons Slate",
            "Primary Strategic Initiative",
            "Zero-Waste & Open Science Guild",
            "Interdisciplinary collective championing shared lab equipment libraries, zero-waste dining logistics, and open sustainability datasets.",
            "Sustainability begins with material circularity and shared tooling. We propose a unified equipment exchange and zero-landfill procurement standard.",
            "Circular resource stewardship paired with open climate research.",
            [
                "Eliminate single-use packaging across all campus venues",
                "Build a cross-departmental scientific hardware lending bank",
                "Publish open lifecycle carbon data for procurement",
            ],
            "#222222",
            34,
        ),
        # Election 3 (Upcoming)
        (
            e3,
            "Priya Nair",
            "Advisory Board Seat A",
            "Open Fiber Collaborative",
            "Telecommunications policy analyst advocating for open-access municipal conduits and neutral ISP competition.",
            "Publicly owned middle-mile fiber lowers household costs while preserving competitive choice. Our advisory framework sets clear open-access rules.",
            "Abundant, affordable regional bandwidth governed in the public interest.",
            [
                "Draft model municipal dig-once conduit ordinance",
                "Publish quarterly regional speed & affordability maps",
                "Protect municipal subscriber privacy by contract",
            ],
            "#C8A96A",
            0,
        ),
        (
            e3,
            "Henrik Lindqvist",
            "Advisory Board Seat A",
            "Nordic-Style Public Trust",
            "Security engineer focused on resilient civic DNS, redundant emergency communications, and critical infrastructure audits.",
            "Digital infrastructure must endure severe weather and cyber incidents alike. I advocate rigorous tabletop exercises and transparent incident disclosures.",
            "Resilient regional connectivity built for high-trust public institutions.",
            [
                "Establish biannual regional infrastructure resilience drills",
                "Mandate independent uptime & latency reporting",
                "Support rural emergency repeater redundancy",
            ],
            "#D96C53",
            0,
        ),
        # Election 4 (Completed)
        (
            e4,
            "Neighborhood Libraries & Learning Hubs",
            "Capital Allocation Priority",
            "Public Knowledge Trust",
            "Coalition of branch librarians, educators, and youth advocates expanding evening hours and maker studios.",
            "Invest participatory funds into extended library hours, multilingual media collections, and quiet co-working alcoves across every ward.",
            "Every neighborhood within a 15-minute walk of a vibrant civic learning hub.",
            [
                "Extend evening & Sunday hours at 9 branch libraries",
                "Equip 4 new community media and fabrication labs",
                "Double early-literacy outreach grants",
            ],
            "#C8A96A",
            174,
        ),
        (
            e4,
            "Urban Canopy & Heat-Island Cooling",
            "Capital Allocation Priority",
            "Metro Shade Collective",
            "Urban ecologists and arborists targeting high-heat residential corridors for shade trees and permeable sidewalks.",
            "Direct capital funds toward planting 2,400 native shade trees and bioswales in districts experiencing peak summer heat disparities.",
            "Cooler, greener, flood-resilient neighborhood streets.",
            [
                "Plant 2,400 drought-resilient native shade trees",
                "Convert 14 concrete plazas into permeable green courts",
                "Train 40 paid youth urban forestry apprentices",
            ],
            "#222222",
            132,
        ),
        (
            e4,
            "Accessible Smart Transit Shelters",
            "Capital Allocation Priority",
            "Transit Riders Union",
            "Commuter advocacy group designing weather-protected, e-ink real-time bus shelters with tactile audio beacons.",
            "Upgrade 65 high-ridership bus stops with solar-lit seating, tactile route maps, and low-glare arrival displays.",
            "Dignified, accessible daily waiting environments for transit riders.",
            [
                "Install 65 sheltered stops in underserved corridors",
                "Add audio-tactile route guidance for low-vision riders",
                "Prioritize crossings near schools and clinics",
            ],
            "#D96C53",
            86,
        ),
        # Election 5 (Completed)
        (
            e5,
            "Open Schema & Real-Time Feeds Standard",
            "Governance Framework",
            "Civic Data Guild",
            "Data architects proposing standardized JSON-Schema civic APIs with documented SLAs.",
            "Adopt unified open schemas across transit, budgeting, and permitting endpoints with automatic validation.",
            "Interoperable civic data ecosystems with zero proprietary friction.",
            [
                "Ratify 12 core municipal data schemas",
                "Require automated schema health checks",
                "Publish developer sandbox & migration guides",
            ],
            "#C8A96A",
            118,
        ),
        (
            e5,
            "Privacy-First Aggregate Reporting Standard",
            "Governance Framework",
            "Digital Rights Forum",
            "Privacy researchers focused on differential privacy and strict aggregation thresholds for public datasets.",
            "Require minimum k-anonymity and differential privacy reviews before any resident-adjacent dataset is released publicly.",
            "Maximum public insight with zero compromise on resident privacy.",
            [
                "Institute pre-release privacy impact assessments",
                "Enforce minimum aggregation thresholds on ward data",
                "Publish annual data governance compliance scorecards",
            ],
            "#222222",
            84,
        ),
    ]

    ballots_to_add = []
    participation_to_add = []

    for (
        election,
        name,
        position,
        org,
        bio,
        manifesto,
        vision,
        objectives,
        color,
        sim_votes,
    ) in candidates_data:
        cand = Candidate(
            name=name,
            position=position,
            organization=org,
            biography=bio,
            manifesto=manifesto,
            vision=vision,
            objectives_json=json.dumps(objectives),
            accent_color=color,
            election_id=election.id,
        )
        db.add(cand)
        db.flush()

        for i in range(sim_votes):
            offset_hours = (i * 37) % 48
            ts = election.start_time + timedelta(hours=offset_hours, minutes=(i * 11) % 60)
            if ts > now:
                ts = now - timedelta(minutes=(i % 120) + 5)
            ballots_to_add.append(
                DemoBallot(
                    election_id=election.id,
                    candidate_id=cand.id,
                    submission_timestamp=ts,
                    demo_session_ref=f"SV-SIM-{secrets.token_hex(5).upper()}",
                )
            )

    db.add_all(ballots_to_add)
    db.flush()

    # 4. Aggregate participation curves for results timeline charts
    timeline_configs = [
        (e1, [34, 79, 128, 176, 221, 254, 276], 48),
        (e2, [22, 54, 88, 119, 145, 164], 24),
        (e4, [45, 118, 196, 265, 329, 368, 392], 300),
        (e5, [28, 67, 112, 151, 182, 202], 220),
    ]
    for election, counts, total_span_hours in timeline_configs:
        step_hours = max(total_span_hours // len(counts), 1)
        for idx, count in enumerate(counts):
            pt_time = election.start_time + timedelta(hours=(idx + 1) * step_hours)
            if pt_time > now:
                pt_time = now - timedelta(hours=max(len(counts) - idx, 1))
            participation_to_add.append(
                ElectionParticipation(
                    election_id=election.id,
                    participation_count=count,
                    timestamp=pt_time,
                )
            )
    db.add_all(participation_to_add)

    # 5. Non-sensitive Audit Events
    audit_events = [
        ElectionAuditEvent(
            event_type="ELECTION_CREATED",
            election_id=e4.id,
            timestamp=now - timedelta(days=50),
            event_metadata=json.dumps({"title": e4.title, "status": "upcoming"}),
        ),
        ElectionAuditEvent(
            event_type="ELECTION_STATUS_CHANGED",
            election_id=e4.id,
            timestamp=now - timedelta(days=26),
            event_metadata=json.dumps({"previous_status": "active", "new_status": "completed"}),
        ),
        ElectionAuditEvent(
            event_type="RESULTS_PUBLISHED",
            election_id=e4.id,
            timestamp=now - timedelta(days=25),
            event_metadata=json.dumps({"total_simulated_ballots": 392, "mode": "simulated"}),
        ),
        ElectionAuditEvent(
            event_type="ELECTION_STATUS_CHANGED",
            election_id=e5.id,
            timestamp=now - timedelta(days=12),
            event_metadata=json.dumps({"previous_status": "active", "new_status": "completed"}),
        ),
        ElectionAuditEvent(
            event_type="ELECTION_STATUS_CHANGED",
            election_id=e1.id,
            timestamp=now - timedelta(days=2),
            event_metadata=json.dumps({"previous_status": "upcoming", "new_status": "active"}),
        ),
        ElectionAuditEvent(
            event_type="ELECTION_STATUS_CHANGED",
            election_id=e2.id,
            timestamp=now - timedelta(days=1),
            event_metadata=json.dumps({"previous_status": "upcoming", "new_status": "active"}),
        ),
        ElectionAuditEvent(
            event_type="DEMO_BALLOT_RECORDED",
            election_id=e1.id,
            timestamp=now - timedelta(minutes=18),
            event_metadata=json.dumps({"simulation": True, "aggregate_count": 276}),
        ),
        ElectionAuditEvent(
            event_type="DEMO_BALLOT_RECORDED",
            election_id=e2.id,
            timestamp=now - timedelta(minutes=9),
            event_metadata=json.dumps({"simulation": True, "aggregate_count": 164}),
        ),
    ]
    db.add_all(audit_events)
    db.commit()
