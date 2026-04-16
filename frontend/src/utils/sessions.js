/**
 * LocalStorage helpers for saved screening sessions (Multi-job + ATS log).
 * Each session is stored as:
 * {
 *   id:            string   — timestamp-based unique id
 *   timestamp:     string   — ISO date string
 *   jdPreview:     string   — first 120 chars of the JD
 *   jdText:        string   — full JD text
 *   candidateCount:number
 *   topScore:      number   — final_score_pct of #1 candidate
 *   topCandidate:  string   — filename of #1 candidate
 *   data:          object   — full API response { results, jd_skills }
 * }
 */

const KEY = 'resume_screener_sessions'
const MAX_SESSIONS = 25

export function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveSession({ jdText, data }) {
  const top = data.results[0]
  const session = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    jdPreview: jdText.trim().slice(0, 120),
    jdText,
    candidateCount: data.results.length,
    topScore: top?.scores.final_score_pct ?? 0,
    topCandidate: top?.filename ?? '—',
    data,
  }
  const existing = loadSessions()
  const updated = [session, ...existing].slice(0, MAX_SESSIONS)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return session
}

export function deleteSession(id) {
  const updated = loadSessions().filter((s) => s.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function clearAllSessions() {
  localStorage.removeItem(KEY)
}

/** Format an ISO timestamp for display. */
export function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
