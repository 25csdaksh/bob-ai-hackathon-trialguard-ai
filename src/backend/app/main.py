from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.session import Base, engine, SessionLocal
from .seed.seed_data import seed_database
from .services.risk_scoring import recalculate_site_risk_scores
from .api import dashboard, sites, deviations, capa, copilot

app = FastAPI(
    title="TrialGuard AI — Backend API",
    description="Clinical Trial Risk Monitor & Protocol Deviation Detector API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        recalculate_site_risk_scores(db)
    finally:
        db.close()

app.include_router(dashboard.router)
app.include_router(sites.router)
app.include_router(deviations.router)
app.include_router(capa.router)
app.include_router(copilot.router)

@app.get("/")
def root():
    return {
        "system": "TrialGuard AI",
        "status": "online",
        "documentation": "/docs"
    }
