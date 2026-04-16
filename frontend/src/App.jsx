import { useState, useMemo } from 'react'

import Header from './components/Header'
import TabBar from './components/TabBar'
import Footer from './components/Footer'
import LoadingOverlay from './components/LoadingOverlay'

import ScreenTab     from './components/tabs/ScreenTab'
import CandidatesTab from './components/tabs/CandidatesTab'
import EthicsTab     from './components/tabs/EthicsTab'
import JobsTab       from './components/tabs/JobsTab'
import HistoryTab    from './components/tabs/HistoryTab'

import { getSampleJd, screenResumes, screenSamples } from './api'
import { saveSession, loadSessions } from './utils/sessions'
import { detectBias } from './utils/biasDetection'

export default function App() {
  // ── Core screening state ──────────────────────────────────────────────────
  const [jdText, setJdText]       = useState('')
  const [files, setFiles]         = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData]           = useState(null)    // { results, jd_skills }
  const [error, setError]         = useState('')
  const [sampleReady, setSampleReady] = useState(false)

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('screen')

  // ── Sessions (Jobs + History) ─────────────────────────────────────────────
  const [sessions, setSessions]           = useState(() => loadSessions())
  const [currentSessionId, setCurrentSessionId] = useState(null)

  // ── Bias warnings (derived) ───────────────────────────────────────────────
  const biasWarnings = useMemo(
    () => (data ? detectBias(data.results) : []),
    [data]
  )

  const wordCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLoadSamples = async () => {
    setError('')
    try {
      const { text } = await getSampleJd()
      setJdText(text); setFiles([]); setSampleReady(true)
    } catch {
      setError('Could not load sample data. Is the API server running?')
    }
  }

  const handleScreen = async () => {
    if (!jdText.trim()) { setError('Please paste a job description first.'); return }
    if (files.length === 0 && !sampleReady) {
      setError("Upload at least one resume, or click 'Load sample resumes + JD'."); return
    }
    setError(''); setIsLoading(true); setSampleReady(false)

    try {
      const result = files.length > 0
        ? await screenResumes(jdText, files)
        : await screenSamples(jdText)

      setData(result)

      // Auto-save session
      const saved = saveSession({ jdText, data: result })
      setSessions(loadSessions())
      setCurrentSessionId(saved.id)

      // Auto-switch to Candidates tab
      setActiveTab('candidates')
    } catch (e) {
      setError(`Screening failed: ${e.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadSession = (session) => {
    if (!session) {
      // "New Job" — clear for a fresh start and go back to Screen tab
      setJdText(''); setFiles([]); setData(null)
      setSampleReady(false); setError(''); setCurrentSessionId(null)
      setActiveTab('screen')
      return
    }
    setJdText(session.jdText)
    setData(session.data)
    setFiles([]); setSampleReady(false); setError('')
    setCurrentSessionId(session.id)
    setActiveTab('candidates')   // jump straight to results
  }

  const refreshSessions = () => setSessions(loadSessions())

  // ── Tab content ───────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'screen':
        return (
          <ScreenTab
            jdText={jdText}
            onJdChange={(v) => { setJdText(v); setSampleReady(false) }}
            wordCount={wordCount}
            files={files}
            onFilesChange={setFiles}
            onLoadSamples={handleLoadSamples}
            sampleReady={sampleReady}
            onScreen={handleScreen}
            isLoading={isLoading}
            error={error}
            hasResults={!!data}
            onViewResults={() => setActiveTab('candidates')}
          />
        )
      case 'candidates':
        return <CandidatesTab data={data} jdText={jdText} />
      case 'ethics':
        return <EthicsTab data={data} />
      case 'jobs':
        return (
          <JobsTab
            sessions={sessions}
            currentSessionId={currentSessionId}
            onLoad={handleLoadSession}
            onNewJob={() => handleLoadSession(null)}
            onRefresh={refreshSessions}
          />
        )
      case 'history':
        return (
          <HistoryTab
            sessions={sessions}
            currentSessionId={currentSessionId}
            onLoad={handleLoadSession}
            onRefresh={refreshSessions}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        data={data}
        sessions={sessions}
        biasWarnings={biasWarnings}
      />

      <main className="flex-1">
        {renderTab()}
      </main>

      {isLoading && <LoadingOverlay />}
      <Footer />
    </div>
  )
}
