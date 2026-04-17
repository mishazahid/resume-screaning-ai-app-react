"""
parser.py
=========
Handles extraction and cleaning of text from uploaded PDF resumes and raw
job-description strings.

Key responsibilities:
  - Parse PDF bytes/paths via PyMuPDF (fitz)
  - Detect common resume sections using case-insensitive regex heuristics
  - Provide a lightweight text-cleaning helper used across the pipeline
  - Normalize raw job-description input into a consistent dict

All public functions return dicts so callers never need to handle bare strings
and can always inspect sub-fields without crashing.
"""

import re
import string
import io
from typing import Union

EMAIL_RE    = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')
PHONE_RE      = re.compile(
    r'\+\d{1,3}[\s.\-]\d{6,12}'                                          # +92-3325516351 style
    r'|\+?[\d]{0,3}[\s.\-]?\(?\d{2,4}\)?[\s.\-]\d{2,4}[\s.\-]?\d{3,5}' # segmented style
)
YEAR_RANGE_RE = re.compile(r'(19|20)\d{2}\s*[-–—to]\s*(19|20)\d{2}')
TWO_YEARS_RE  = re.compile(r'^(19|20)\d{2}(19|20)\d{2}$')
LINKEDIN_RE   = re.compile(r'linkedin\.com/in/([A-Za-z0-9\-_%]+)', re.IGNORECASE)
GITHUB_RE     = re.compile(
    r'(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9][A-Za-z0-9\-]{0,38})'
    r'|(?:github|gh)\s*[:\|]\s*([A-Za-z0-9][A-Za-z0-9\-]{0,38})',
    re.IGNORECASE
)

def _extract_email(text: str):
    m = EMAIL_RE.search(text)
    return m.group(0) if m else None

def _extract_phone(text: str):
    for m in PHONE_RE.finditer(text):
        matched = m.group(0).strip()
        if YEAR_RANGE_RE.search(matched):
            continue
        digits = re.sub(r'\D', '', matched)
        if not (7 <= len(digits) <= 15):
            continue
        if TWO_YEARS_RE.match(digits):
            continue
        return matched
    return None

def _extract_linkedin(text: str):
    m = LINKEDIN_RE.search(text)
    return f"https://linkedin.com/in/{m.group(1)}" if m else None

def _extract_github(text: str):
    m = GITHUB_RE.search(text)
    if not m:
        return None
    username = m.group(1) or m.group(2)
    return f"https://github.com/{username}"

import fitz  # PyMuPDF


# ---------------------------------------------------------------------------
# Section heading patterns
# Each key is the canonical section name; the value is a regex that matches
# any of the known heading variants (case-insensitive).
# ---------------------------------------------------------------------------
SECTION_PATTERNS: dict[str, str] = {
    # Broader summary/profile variants seen in real resumes
    "summary": (
        r"(?:professional\s+profile|executive\s+profile|career\s+profile|"
        r"career\s+summary|personal\s+statement|candidate\s+profile|"
        r"summary|objective|profile|about\s*me|about)"
    ),
    # Broader skills variants
    "skills": (
        r"(?:technical\s+skills|core\s+competencies|technologies|"
        r"proficient\s+skills|key\s+skills|areas\s+of\s+expertise|"
        r"technical\s+expertise|skill\s+set|competencies|skills)"
    ),
    # Broader experience variants
    "experience": (
        r"(?:professional\s+experience|work\s+experience|work\s+history|"
        r"employment\s+history|career\s+history|professional\s+history|"
        r"employment|experience)"
    ),
    # Broader education variants
    "education": (
        r"(?:educational\s+history|educational\s+background|academic\s+history|"
        r"academic\s+background|qualifications|education)"
    ),
    # Broader projects/activities variants
    "projects": (
        r"(?:personal\s+projects|key\s+projects|notable\s+projects|"
        r"other\s+activities|activities|portfolio|projects)"
    ),
}

# Order matters when we scan headings: more specific patterns first so that
# "technical skills" is not captured by the bare "skills" pattern first.
SECTION_ORDER: list[str] = ["summary", "skills", "experience", "education", "projects"]


def clean_text(text: str) -> str:
    """
    Normalise raw text for downstream NLP tasks.

    Steps
    -----
    1. Lowercase everything.
    2. Remove all punctuation *except* hyphens that sit between word characters
       (e.g. "up-to-date" is preserved, a lone "-" is removed).
    3. Collapse any run of whitespace (spaces, tabs, newlines) to a single space.
    4. Strip leading / trailing whitespace.

    Parameters
    ----------
    text : str
        Any raw string.

    Returns
    -------
    str
        Cleaned, lowercase string.
    """
    if not text:
        return ""

    text = text.lower()

    # Keep hyphens only when they are surrounded by word characters
    # Remove all other punctuation characters
    punctuation_to_remove = re.sub(r"(\w)-(\w)", r"\1HYPHEN\2", text)
    # Strip punctuation (but not the placeholder)
    for ch in string.punctuation:
        punctuation_to_remove = punctuation_to_remove.replace(ch, " ")
    # Restore hyphens
    text = punctuation_to_remove.replace("HYPHEN", "-")

    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _detect_sections(raw_text: str) -> dict[str, str]:
    """
    Scan *raw_text* for known section headings and slice out the content that
    follows each heading up to the next detected heading.

    The approach:
      1. Split the text into lines.
      2. For each line check whether it looks like a section heading
         (short line matching one of our patterns, possibly followed by a
         colon or a run of dashes/equals).
      3. Record (line_index, section_name) for every match.
      4. Slice the lines between consecutive matches to build section content.

    Parameters
    ----------
    raw_text : str
        The full, unsanitised text extracted from the PDF.

    Returns
    -------
    dict[str, str]
        Keys are canonical section names; values are the raw text of each
        section (empty string if the section was not found).
    """
    sections: dict[str, str] = {name: "" for name in SECTION_ORDER}
    lines = raw_text.split("\n")

    # Compile heading matchers once
    compiled: dict[str, re.Pattern] = {
        name: re.compile(
            r"^\s*" + pattern + r"\s*[:\-–—]*\s*$",
            re.IGNORECASE,
        )
        for name, pattern in SECTION_PATTERNS.items()
    }

    # List of (line_index, canonical_section_name) for found headings
    found_headings: list[tuple[int, str]] = []

    for idx, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        # A heading line is typically short (< 60 chars) so skip very long lines
        if len(stripped) > 60:
            continue
        for name, pattern in compiled.items():
            if pattern.match(stripped):
                found_headings.append((idx, name))
                break  # One section per line

    # Slice content between consecutive headings
    for i, (start_idx, section_name) in enumerate(found_headings):
        end_idx = found_headings[i + 1][0] if i + 1 < len(found_headings) else len(lines)
        # Content starts on the line AFTER the heading line
        content_lines = lines[start_idx + 1 : end_idx]
        sections[section_name] = "\n".join(content_lines).strip()

    return sections


def extract_text(file: Union[str, "io.BytesIO"]) -> dict:
    """
    Extract and structure text from a PDF resume.

    Accepts either a filesystem path (str) or a BytesIO-like object (e.g. from
    Streamlit's file_uploader).  Uses PyMuPDF as the primary parser.

    Parameters
    ----------
    file : str | BytesIO
        Path to a PDF file, or an in-memory bytes buffer.

    Returns
    -------
    dict with keys:
        filename    : str   — basename of the file (or "unknown" for BytesIO)
        raw_text    : str   — concatenated text of all pages, as extracted
        cleaned_text: str   — lowercase, punctuation-stripped, whitespace-collapsed
        sections    : dict  — keys: summary, skills, experience, education, projects
        error       : str | None — error message on failure, else None
    """
    result: dict = {
        "filename": "unknown",
        "raw_text": "",
        "cleaned_text": "",
        "sections": {name: "" for name in SECTION_ORDER},
        "error": None,
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
    }

    try:
        # ---- Determine filename and open the document --------------------
        if isinstance(file, str):
            result["filename"] = file.split("/")[-1].split("\\")[-1]
            doc = fitz.open(file)
        else:
            # BytesIO / UploadedFile from Streamlit
            filename = getattr(file, "name", "unknown.pdf")
            result["filename"] = filename
            # Read bytes from whatever buffer type was provided
            file_bytes = file.read() if hasattr(file, "read") else bytes(file.getvalue())

            # ---- Plain-text fallback: .txt files skip PyMuPDF entirely ----
            if filename.lower().endswith(".txt"):
                raw = file_bytes.decode("utf-8", errors="replace")
                result["raw_text"] = raw
                result["email"]    = _extract_email(raw)
                result["phone"]    = _extract_phone(raw)
                result["linkedin"] = _extract_linkedin(raw)
                result["github"]   = _extract_github(raw)
                result["cleaned_text"] = clean_text(raw)
                result["sections"] = _detect_sections(raw)
                return result

            # ---- Try PyMuPDF; fall back to UTF-8 if the bytes are not a PDF ----
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
            except Exception:
                # Not a valid PDF stream — attempt to read as plain text
                raw = file_bytes.decode("utf-8", errors="replace").strip()
                if raw:
                    result["raw_text"]     = raw
                    result["email"]        = _extract_email(raw)
                    result["phone"]        = _extract_phone(raw)
                    result["linkedin"]     = _extract_linkedin(raw)
                    result["github"]       = _extract_github(raw)
                    result["cleaned_text"] = clean_text(raw)
                    result["sections"]     = _detect_sections(raw)
                else:
                    result["error"] = (
                        "File is not a valid PDF and contains no readable text."
                    )
                return result

        # ---- Extract text and hyperlinks from every page -----------------
        page_texts: list[str] = []
        link_uris: list[str] = []
        for page in doc:
            page_text = page.get_text("text")
            if page_text:
                page_texts.append(page_text)
            for link in page.get_links():
                uri = link.get("uri", "")
                if uri:
                    link_uris.append(uri)
        doc.close()

        raw = "\n".join(page_texts)
        link_blob = "\n".join(link_uris)  # searchable string of all URIs

        # Guard against scanned-only PDFs with no embedded text
        if not raw.strip():
            result["error"] = (
                "No extractable text found. The PDF may be scanned/image-only."
            )
            return result

        result["raw_text"] = raw
        result["email"]    = _extract_email(raw)
        result["phone"]    = _extract_phone(raw)
        # Check text first, fall back to embedded hyperlink URIs
        result["linkedin"] = _extract_linkedin(raw) or _extract_linkedin(link_blob)
        result["github"]   = _extract_github(raw)   or _extract_github(link_blob)
        result["cleaned_text"] = clean_text(raw)
        result["sections"] = _detect_sections(raw)

    except Exception as exc:  # noqa: BLE001
        result["error"] = f"Failed to parse PDF: {exc}"

    return result


def normalize_jd(jd_text: str) -> dict:
    """
    Normalise a raw job-description string into a consistent dict.

    Parameters
    ----------
    jd_text : str
        The full text pasted by the user.

    Returns
    -------
    dict with keys:
        raw       : str — original text unchanged
        cleaned   : str — lowercase, punctuation-stripped, whitespace-collapsed
        word_count: int — number of whitespace-separated tokens in the raw text
    """
    raw = jd_text or ""
    return {
        "raw": raw,
        "cleaned": clean_text(raw),
        "word_count": len(raw.split()) if raw.strip() else 0,
    }


# ---------------------------------------------------------------------------
# Quick smoke-test — run this file directly to verify basic functionality
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Test clean_text
    sample = "  Hello, World!  This is a TEST-case with  extra   spaces.\n"
    print("clean_text:", repr(clean_text(sample)))

    # Test normalize_jd
    jd = "We are looking for a Senior Data Scientist with 5+ years of experience in Python and ML."
    jd_data = normalize_jd(jd)
    print("\nnormalize_jd:")
    for k, v in jd_data.items():
        print(f"  {k}: {v!r}")

    # Test extract_text with a non-existent file (should return error gracefully)
    result = extract_text("nonexistent.pdf")
    print("\nextract_text (bad path):")
    print(f"  error: {result['error']}")
    print(f"  filename: {result['filename']}")
