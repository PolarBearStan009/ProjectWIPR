from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from database import engine, Base, get_db, init_db, User, WeeklyMetric, DomainScore

app = FastAPI(title="WIPR Performance Engine API")

# Allow the Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    # Seed a default user for demo
    db = next(get_db())
    if not db.query(User).first():
        db.add(User(id=1, name="Ash", role="Lead Engineer"))
        db.commit()

# --- Pydantic Schemas ---

class DomainInput(BaseModel):
    name: str
    weight: float
    score: float

class CalculateRequest(BaseModel):
    T_minutes: int
    B_days: int
    W_weight: float
    k1_bonus: float
    ke_bonus: float
    N_violations: int
    D_severity: float
    domains: List[DomainInput]

class CalculateResponse(BaseModel):
    G: float
    M: float
    Pi2: float
    sigma2: float
    numerator: float
    denominator: float
    final_score: float

class UserCreate(BaseModel):
    name: str
    role: str = "Staff"

# --- Core Logic ---

def compute_wipr_score(data: CalculateRequest) -> CalculateResponse:
    G = sum(d.score * d.weight for d in data.domains)
    M = 1.0 + data.k1_bonus + data.ke_bonus
    Pi2 = (data.B_days * data.W_weight) ** 2
    KAPPA = 0.28572
    sigma2 = (data.N_violations * data.D_severity * KAPPA) ** 2
    numerator = G * data.T_minutes * M * Pi2
    denominator = (1 + sigma2) * 1000.0
    final_score = round(numerator / denominator, 4) if denominator != 0 else 0

    return CalculateResponse(
        G=round(G, 4),
        M=round(M, 4),
        Pi2=round(Pi2, 4),
        sigma2=round(sigma2, 8),
        numerator=round(numerator, 4),
        denominator=round(denominator, 4),
        final_score=final_score
    )

# --- User Endpoints ---

@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/api/users")
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    user = User(name=body.name, role=body.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# --- Score Endpoints ---

@app.post("/api/calculate", response_model=CalculateResponse)
def calculate_live_score(request: CalculateRequest):
    """Stateless live preview — does NOT save to DB"""
    return compute_wipr_score(request)

@app.post("/api/metrics")
def save_metrics(request: CalculateRequest, user_id: int = 1, db: Session = Depends(get_db)):
    """Compute and persist a weekly evaluation"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(name=f"User {user_id}", role="Staff")
        db.add(user)
        db.commit()
        db.refresh(user)

    computation = compute_wipr_score(request)

    new_metric = WeeklyMetric(
        user_id=user.id,
        week_date=datetime.utcnow(),
        T_minutes=request.T_minutes,
        B_days=request.B_days,
        W_weight=request.W_weight,
        k1_bonus=request.k1_bonus,
        ke_bonus=request.ke_bonus,
        N_violations=request.N_violations,
        D_severity=request.D_severity,
        computed_score=computation.final_score
    )
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)

    for d in request.domains:
        db.add(DomainScore(
            weekly_metric_id=new_metric.id,
            domain_name=d.name,
            weight=d.weight,
            score=d.score
        ))
    db.commit()

    return {
        "status": "success",
        "metric_id": new_metric.id,
        "computed_score": computation.final_score,
        "breakdown": computation.model_dump()
    }

@app.get("/api/metrics/{user_id}")
def get_user_metrics(user_id: int, db: Session = Depends(get_db)):
    """Historical scores for a user"""
    metrics = (
        db.query(WeeklyMetric)
        .filter(WeeklyMetric.user_id == user_id)
        .order_by(WeeklyMetric.week_date.asc())
        .all()
    )
    result = []
    for m in metrics:
        domains = db.query(DomainScore).filter(DomainScore.weekly_metric_id == m.id).all()
        result.append({
            "id": m.id,
            "week_date": m.week_date.isoformat(),
            "computed_score": m.computed_score,
            "T_minutes": m.T_minutes,
            "B_days": m.B_days,
            "W_weight": m.W_weight,
            "k1_bonus": m.k1_bonus,
            "ke_bonus": m.ke_bonus,
            "N_violations": m.N_violations,
            "D_severity": m.D_severity,
            "domains": [{"name": d.domain_name, "weight": d.weight, "score": d.score} for d in domains]
        })
    return result

@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Latest score per user, sorted descending"""
    users = db.query(User).all()
    board = []
    for u in users:
        latest = (
            db.query(WeeklyMetric)
            .filter(WeeklyMetric.user_id == u.id)
            .order_by(WeeklyMetric.week_date.desc())
            .first()
        )
        board.append({
            "user_id": u.id,
            "name": u.name,
            "role": u.role,
            "latest_score": round(latest.computed_score, 2) if latest else None,
            "total_entries": db.query(WeeklyMetric).filter(WeeklyMetric.user_id == u.id).count()
        })
    board.sort(key=lambda x: (x["latest_score"] or 0), reverse=True)
    return board

@app.get("/api/all_metrics")
def get_all_metrics(db: Session = Depends(get_db)):
    """All entries from database with user info"""
    metrics = db.query(WeeklyMetric).order_by(WeeklyMetric.week_date.desc()).all()
    result = []
    for m in metrics:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append({
            "id": m.id,
            "user_name": user.name if user else "Unknown",
            "week_date": m.week_date.isoformat(),
            "computed_score": round(m.computed_score, 2),
            "T_minutes": m.T_minutes,
            "N_violations": m.N_violations,
        })
    return result
