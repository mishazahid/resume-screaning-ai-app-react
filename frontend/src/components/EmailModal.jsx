import { useState } from 'react'
import { sendEmail } from '../api'

const TEMPLATES = [
  { id: 'shortlist', label: 'Shortlist Notification', color: 'emerald',
    description: 'Inform the candidate they have been shortlisted.' },
  { id: 'interview', label: 'Interview Invite', color: 'indigo',
    description: 'Invite the candidate to schedule an interview.' },
  { id: 'rejection', label: 'Rejection Email', color: 'red',
    description: 'Politely decline the candidate\'s application.' },
]

export default function EmailModal({ candidate, jdPreview, onClose }) {
  const [template, setTemplate]   = useState('shortlist')
  const [email, setEmail]         = useState(candidate.candidate_email || '')
  const [sending, setSending]     = useState(false)
  const [result, setResult]       = useState(null)

  const name = candidate.filename
    .replace(/\.(pdf|txt)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const handleSend = async () => {
    if (!email.trim()) return
    setSending(true)
    try {
      const res = await sendEmail(email.trim(), name, template, jdPreview)
      setResult(res)
    } catch (e) {
      setResult({ success: false, message: e.message })
    } finally {
      setSending(false)
    }
  }

  const selectedTpl = TEMPLATES.find(t => t.id === template)

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Send Email</h2>
              <p className="text-xs text-slate-400">to {name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {result ? (
            /* Sent result screen */
            <div className={`rounded-xl p-5 text-center ${result.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${result.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {result.success ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className={`text-sm font-semibold mb-1 ${result.success ? 'text-emerald-800' : 'text-red-700'}`}>
                {result.success ? (result.simulated ? 'Email Simulated \u2713' : 'Email Sent \u2713') : 'Failed to Send'}
              </p>
              <p className="text-xs text-slate-500">{result.message}</p>
              {result.simulated && (
                <p className="text-[11px] text-amber-600 mt-2">
                  Set <code className="bg-amber-50 px-1 rounded">RESEND_API_KEY</code> env var to send real emails.
                </p>
              )}
              <button onClick={onClose}
                className="mt-4 px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Email field */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Recipient Email
                  {!candidate.candidate_email && (
                    <span className="ml-2 text-amber-500 font-normal">(not found in resume — enter manually)</span>
                  )}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="candidate@email.com"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                />
              </div>

              {/* Template selector */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Email Template</label>
                <div className="space-y-2">
                  {TEMPLATES.map(tpl => {
                    const colors = {
                      emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800',
                      indigo:  'border-indigo-300 bg-indigo-50 text-indigo-800',
                      red:     'border-red-300 bg-red-50 text-red-800',
                    }
                    const isSelected = template === tpl.id
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => setTemplate(tpl.id)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl border-2 transition-all ${
                          isSelected ? colors[tpl.color] : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <p className="text-xs font-semibold">{tpl.label}</p>
                        <p className="text-[11px] opacity-70 mt-0.5">{tpl.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={sending || !email.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending\u2026
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send {selectedTpl?.label}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
