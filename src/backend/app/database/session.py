import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ORIGINAL_DB = os.path.join(BASE_DIR, 'trialguard.db')

if os.environ.get("VERCEL"):
    import shutil
    TMP_DB = "/tmp/trialguard.db"
    if not os.path.exists(TMP_DB) and os.path.exists(ORIGINAL_DB):
        try:
            shutil.copyfile(ORIGINAL_DB, TMP_DB)
        except Exception:
            pass
    DEFAULT_DB = f"sqlite:///{TMP_DB}"
else:
    DEFAULT_DB = f"sqlite:///{ORIGINAL_DB}"

DB_PATH = os.environ.get("DATABASE_URL", DEFAULT_DB)

engine = create_engine(
    DB_PATH,
    connect_args={"check_same_thread": False} if DB_PATH.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
