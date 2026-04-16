/**
 * API client for the Resume Screening AI backend.
 * All functions return parsed JSON or throw on HTTP errors.
 *
 * VITE_API_URL — set this in Vercel env vars to your Railway backend URL
 *                e.g. https://your-app.railway.app
 *                Leave empty when frontend + backend are on the same origin.
 */
const API_BASE = import.meta.env.VITE_API_URL || ''

export async function getSampleJd() {
  const res = await fetch(`${API_BASE}/api/sample-jd`)
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  return res.json()
}

export async function screenResumes(jdText, files) {
  const form = new FormData()
  form.append('jd_text', jdText)
  files.forEach((file) => form.append('files', file))

  const res = await fetch(`${API_BASE}/api/screen`, { method: 'POST', body: form })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Server error ${res.status}: ${body}`)
  }
  return res.json()
}

export async function screenSamples(jdText) {
  const form = new FormData()
  form.append('jd_text', jdText)

  const res = await fetch(`${API_BASE}/api/screen-samples`, { method: 'POST', body: form })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Server error ${res.status}: ${body}`)
  }
  return res.json()
}

export async function sendEmail(toEmail, toName, template, jdPreview) {
  const res = await fetch(`${API_BASE}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to_email: toEmail, to_name: toName, template, jd_preview: jdPreview }),
  })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}
