"""
TerraWatch — Reset and Re-seed Demonstration Environment Script
Drops all existing tables and re-seeds cleanly with deterministic demo data.
"""

import sys
import os

# Add root and backend directories to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import engine, Base
from scripts.seed_demo_data import seed_database

def reset_database():
    print("[INFO] Resetting TerraWatch database...")
    Base.metadata.drop_all(bind=engine)
    print("[OK] All existing tables dropped.")
    Base.metadata.create_all(bind=engine)
    print("[OK] Schema recreated cleanly.")
    seed_database()
    print("[DONE] Reset complete! Ready for demonstration.")

if __name__ == "__main__":
    reset_database()
