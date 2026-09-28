"""
Role-Based Authentication Endpoints.
Provides authentication and role switching for Coder and Marketing Team.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Header
from app.schemas.auth import LoginRequest, AuthResponse, UserProfile

router = APIRouter(prefix="/auth")

PREDEFINED_USERS: Dict[str, UserProfile] = {
    "coder": UserProfile(
        id="usr-coder-01",
        name="Alex Chen",
        role="coder",
        role_name="Coder / Engineering Lead",
        email="alex.chen@linear.app",
        title="Lead Staff Software Engineer",
        avatar="/avatar.jpg",
        permissions=[
            "retain_memory",
            "ingest_features",
            "dev_copilot",
            "inspect_memory",
            "view_code_changelog",
            "manage_prs"
        ]
    ),
    "marketing": UserProfile(
        id="usr-mkt-01",
        name="Sarah Jenkins",
        role="marketing",
        role_name="Marketing Team / Growth Lead",
        email="sarah.jenkins@linear.app",
        title="Head of GEO & Organic Growth",
        avatar="/avatar.jpg",
        permissions=[
            "view_analytics",
            "marketing_copilot",
            "citation_probe",
            "competitor_radar",
            "export_reports",
            "reflect_strategy"
        ]
    )
}

@router.get("/roles")
async def get_available_roles() -> Dict[str, Any]:
    """Returns all available roles and their default profiles and permissions."""
    return {
        "roles": [
            {
                "key": "coder",
                "label": "Coder (Engineering)",
                "description": "Updates Vectorize Hindsight memory bank with new features, PR merges, and codebase optimizations.",
                "profile": PREDEFINED_USERS["coder"].model_dump()
            },
            {
                "key": "marketing",
                "label": "Marketing Team (Growth & Strategy)",
                "description": "Monitors citation drops, tracks competitor moves (Jira), and generates GEO strategies.",
                "profile": PREDEFINED_USERS["marketing"].model_dump()
            }
        ]
    }

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest) -> AuthResponse:
    """Authenticates or switches role to Coder or Marketing Team."""
    role_key = req.role.lower().strip()
    if role_key not in PREDEFINED_USERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{req.role}'. Valid roles are: 'coder', 'marketing'."
        )

    user = PREDEFINED_USERS[role_key]
    token = f"jwt-mock-{role_key}-{user.id}"

    return AuthResponse(
        success=True,
        user=user,
        token=token,
        message=f"Successfully authenticated as {user.role_name}"
    )

@router.get("/me", response_model=UserProfile)
async def get_current_user(authorization: str = Header(default="Bearer jwt-mock-coder-usr-coder-01")) -> UserProfile:
    """Returns the current authenticated user profile based on Bearer token."""
    if "marketing" in authorization.lower():
        return PREDEFINED_USERS["marketing"]
    return PREDEFINED_USERS["coder"]
