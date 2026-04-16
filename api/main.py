"""
api/main.py
===========
FastAPI backend for the Resume Screening AI React app.

Development (two terminals):
    uvicorn api.main:app --reload --port 8000
    cd frontend && npm run dev

Production (single service — FastAPI serves the React build):
    cd frontend && npm run build
    uvicorn api.main:app --host 0.0.0.0 --port 8000

Endpoints:
  GET  /api/sample-jd       – return the sample job-description text
  POST /api/screen          – screen uploaded PDF/TXT resumes
  POST /api/screen-samples  – screen the three built-in sample candidates
"""

import sys
import os
import io

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List
from pydantic import BaseModel

# email_service lives next to main.py inside the api/ package
_api_dir = os.path.dirname(os.path.abspath(__file__))
if _api_dir not in sys.path:
    sys.path.insert(0, _api_dir)
from email_service import send_candidate_email

from src.parser import extract_text, normalize_jd
from src.skill_extractor import extract_skills, match_skills
from src.matcher import compute_hybrid_score, get_model, generate_explanation

# ---------------------------------------------------------------------------
app = FastAPI(title="Resume Screening AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _education_label(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ["phd", "ph.d", "doctorate", "doctoral"]):
        return "PhD / Doctorate"
    if any(k in t for k in ["master", "msc", "m.sc", "mba", "m.eng", "ms "]):
        return "Master's"
    if any(k in t for k in ["bachelor", "bsc", "b.sc", "b.eng", "be ", "b.e", "undergraduate"]):
        return "Bachelor's"
    if any(k in t for k in ["associate", "diploma", "hnd"]):
        return "Associate / Diploma"
    return "Not detected"


def _experience_display(detected_years, detected_months: int) -> str:
    if detected_years is None and detected_months == 0:
        return "Not detected"
    if detected_years == 0 and detected_months > 0:
        return f"{detected_months} months (< 1 year)"
    if detected_years is not None:
        leftover = detected_months % 12 if detected_months else 0
        if leftover:
            return f"{detected_years} yr {leftover} mo"
        return f"{detected_years} years"
    return "Not detected"


def _build_result(resume_data: dict, jd_data: dict, jd_skills: list) -> dict:
    """Run the full pipeline for one resume and return a serialisable dict."""
    if resume_data["error"]:
        return {
            "filename": resume_data["filename"],
            "parse_error": resume_data["error"],
            "candidate_email": None,
            "resume_skills": [],
            "skill_match": {
                "matched": [], "missing": jd_skills, "extra": [],
                "match_ratio": 0.0, "skill_score": 0.0,
            },
            "scores": {
                "final_score": 0.0, "final_score_pct": 0.0,
                "semantic_score": 0.0, "tfidf_score": 0.0,
                "skill_score": 0.0, "experience_score": 0.0, "education_score": 0.0,
                "weights": {}, "recommendation": "Weak fit",
                "detected_resume_years": None, "detected_resume_months": 0,
                "detected_jd_years": None,
            },
            "explanation": "",
            "sections": {},
            "education_label": "Not detected",
            "experience_display": "Not detected",
        }

    resume_skills = extract_skills(resume_data["cleaned_text"])
    skill_match = match_skills(resume_skills, jd_skills)
    scores = compute_hybrid_score(jd_data, resume_data, skill_match)
    explanation = generate_explanation(scores, skill_match)

    sections = {
        name: bool(text.strip())
        for name, text in resume_data.get("sections", {}).items()
    }

    return {
        "filename": resume_data["filename"],
        "parse_error": None,
        "candidate_email": resume_data.get("email"),
        "resume_skills": resume_skills,
        "skill_match": skill_match,
        "scores": scores,
        "explanation": explanation,
        "sections": sections,
        "education_label": _education_label(resume_data.get("raw_text", "")),
        "experience_display": _experience_display(
            scores.get("detected_resume_years"),
            scores.get("detected_resume_months", 0),
        ),
    }


# ---------------------------------------------------------------------------
# Start-up: pre-load the heavy ML model once
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    get_model()


# ---------------------------------------------------------------------------
# API endpoints  (must all be registered BEFORE the SPA catch-all below)
# ---------------------------------------------------------------------------

@app.get("/api/sample-jd")
async def get_sample_jd():
    path = os.path.join(PROJECT_ROOT, "data", "sample_jd.txt")
    with open(path, "r", encoding="utf-8") as f:
        return {"text": f.read()}


@app.post("/api/screen")
async def screen_resumes(
    jd_text: str = Form(...),
    files: List[UploadFile] = File(...),
):
    jd_data = normalize_jd(jd_text)
    jd_skills = extract_skills(jd_data["cleaned"])

    all_results = []
    for upload in files:
        raw_bytes = await upload.read()
        buf = io.BytesIO(raw_bytes)
        buf.name = upload.filename
        resume_data = extract_text(buf)
        all_results.append(_build_result(resume_data, jd_data, jd_skills))

    all_results.sort(key=lambda r: r["scores"]["final_score"], reverse=True)
    return {"results": all_results, "jd_skills": jd_skills}


@app.post("/api/screen-samples")
async def screen_sample_resumes(jd_text: str = Form(...)):
    jd_data = normalize_jd(jd_text)
    jd_skills = extract_skills(jd_data["cleaned"])

    sample_dir = os.path.join(PROJECT_ROOT, "data", "sample_resumes")
    fnames = ["candidate_alice.txt", "candidate_bob.txt", "candidate_carol.txt"]

    all_results = []
    for fname in fnames:
        path = os.path.join(sample_dir, fname)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        buf = io.BytesIO(content.encode("utf-8"))
        buf.name = fname
        resume_data = extract_text(buf)
        all_results.append(_build_result(resume_data, jd_data, jd_skills))

    all_results.sort(key=lambda r: r["scores"]["final_score"], reverse=True)
    return {"results": all_results, "jd_skills": jd_skills}


class EmailRequest(BaseModel):
    to_email: str
    to_name: str
    template: str   # "shortlist" | "interview" | "rejection"
    jd_preview: str

@app.post("/api/send-email")
async def send_email_endpoint(req: EmailRequest):
    result = send_candidate_email(req.to_email, req.to_name, req.template, req.jd_preview)
    return result


# ---------------------------------------------------------------------------
# React SPA static serving — production only
# Registered LAST so all /api/* routes above take priority.
# ---------------------------------------------------------------------------
DIST_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")

if os.path.isdir(DIST_DIR):
    _assets = os.path.join(DIST_DIR, "assets")
    if os.path.isdir(_assets):
        app.mount("/assets", StaticFiles(directory=_assets), name="static-assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        target = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
