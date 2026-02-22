import os
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./wipr.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)

    metrics = relationship("WeeklyMetric", back_populates="user")


class WeeklyMetric(Base):
    __tablename__ = "weekly_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    week_date = Column(DateTime, default=datetime.utcnow)
    
    T_minutes = Column(Integer, default=0)
    B_days = Column(Integer, default=0)
    W_weight = Column(Float, default=1.0)
    
    k1_bonus = Column(Float, default=0.0)
    ke_bonus = Column(Float, default=0.0)
    
    N_violations = Column(Integer, default=0)
    D_severity = Column(Float, default=0.0)
    
    computed_score = Column(Float, default=0.0)

    user = relationship("User", back_populates="metrics")
    domain_scores = relationship("DomainScore", back_populates="weekly_metric", cascade="all, delete-orphan")


class DomainScore(Base):
    __tablename__ = "domain_scores"

    id = Column(Integer, primary_key=True, index=True)
    weekly_metric_id = Column(Integer, ForeignKey("weekly_metrics.id"))
    domain_name = Column(String, index=True)
    weight = Column(Float, default=1.0)
    score = Column(Float, default=0.0) # 0-10

    weekly_metric = relationship("WeeklyMetric", back_populates="domain_scores")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
