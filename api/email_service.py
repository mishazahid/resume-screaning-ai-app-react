"""
Email service for Resume Screening AI.

Priority order:
  1. Gmail SMTP  — set GMAIL_USER + GMAIL_APP_PASSWORD  (easiest, no domain needed)
  2. Resend API  — set RESEND_API_KEY  (requires verified domain on free plan)
  3. Simulation  — prints to console, returns success
"""
import os
import json
import smtplib
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

TEMPLATES = {
    "shortlist": {
        "subject": "You've been shortlisted — {role}",
        "body": (
            "Dear {name},\n\n"
            "We are pleased to inform you that you have been shortlisted "
            "for the position of {role}.\n\n"
            "We will be in touch shortly with the next steps.\n\n"
            "Best regards,\nHR Team"
        ),
    },
    "interview": {
        "subject": "Interview Invitation — {role}",
        "body": (
            "Dear {name},\n\n"
            "We would like to invite you to an interview for the position of {role}.\n\n"
            "Please reply to this email with your availability for the coming week.\n\n"
            "Best regards,\nHR Team"
        ),
    },
    "rejection": {
        "subject": "Application Update — {role}",
        "body": (
            "Dear {name},\n\n"
            "Thank you for your interest in the position of {role}. After careful "
            "consideration, we have decided to move forward with other candidates "
            "at this time.\n\n"
            "We appreciate your time and wish you every success.\n\n"
            "Best regards,\nHR Team"
        ),
    },
}


def _send_via_gmail(to_email, to_name, subject, body):
    gmail_user     = os.getenv("GMAIL_USER", "").strip()
    gmail_password = os.getenv("GMAIL_APP_PASSWORD", "").strip()

    msg = MIMEMultipart()
    msg["From"]    = gmail_user
    msg["To"]      = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, to_email, msg.as_string())


def _send_via_resend(to_email, subject, body):
    api_key    = os.getenv("RESEND_API_KEY", "").strip()
    from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

    payload = {
        "from":    from_email,
        "to":      [to_email],
        "subject": subject,
        "text":    body,
    }
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(
        "https://api.resend.com/emails",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type":  "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10):
        pass  # raises on non-2xx


def send_candidate_email(to_email, to_name, template, jd_preview):
    tpl  = TEMPLATES.get(template, TEMPLATES["shortlist"])
    role = jd_preview[:80] if jd_preview else "the role"
    subject = tpl["subject"].format(role=role)
    body    = tpl["body"].format(name=to_name, role=role)

    gmail_user     = os.getenv("GMAIL_USER", "").strip()
    gmail_password = os.getenv("GMAIL_APP_PASSWORD", "").strip()
    resend_key     = os.getenv("RESEND_API_KEY", "").strip()

    # ── 1. Gmail SMTP ────────────────────────────────────────────────────────
    if gmail_user and gmail_password:
        try:
            _send_via_gmail(to_email, to_name, subject, body)
            return {"success": True, "simulated": False, "subject": subject,
                    "message": f"Email sent via Gmail to {to_email}"}
        except Exception as e:
            return {"success": False, "simulated": False, "subject": subject,
                    "message": f"Gmail error: {e}"}

    # ── 2. Resend API ────────────────────────────────────────────────────────
    if resend_key:
        try:
            _send_via_resend(to_email, subject, body)
            return {"success": True, "simulated": False, "subject": subject,
                    "message": f"Email sent via Resend to {to_email}"}
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            return {"success": False, "simulated": False, "subject": subject,
                    "message": f"Resend error {e.code}: {err}"}
        except Exception as e:
            return {"success": False, "simulated": False, "subject": subject,
                    "message": str(e)}

    # ── 3. Simulation ────────────────────────────────────────────────────────
    print(f"[EMAIL SIMULATED] To: {to_email} | Subject: {subject}")
    return {
        "success": True,
        "simulated": True,
        "subject": subject,
        "message": "Email simulated — configure Gmail or Resend to send real emails.",
    }
