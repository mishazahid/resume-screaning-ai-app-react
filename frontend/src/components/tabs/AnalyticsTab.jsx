import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const RECOMMENDATION_COLORS = {
  'Strong fit':  '#6366f1',
  'Good fit':    '#10b981',
  'Partial fit': '#f59e0b',
  'Weak fit':    '#ef4444',
}

const SCORE_BUCKET_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#6366f1']

function KpiCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo:  'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900',
    amber:   'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-900',
    violet:  'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border-violet-100 dark:border-violet-900',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
  )
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 ${className}`}>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</p>
      {children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#a5b4fc' }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsTab({ data }) {
  const results = data?.results ?? []

  const kpis = useMemo(() => {
    if (!results.length) return null
    const scores = results.map((r) => r.scores.final_score_pct)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const strongFit = results.filter((r) => r.scores.recommendation === 'Strong fit').length
    const withEmail = results.filter((r) => r.candidate_email).length
    return {
      total: results.length,
      avg: avg.toFixed(1),
      strongFitPct: Math.round((strongFit / results.length) * 100),
      emailPct: Math.round((withEmail / results.length) * 100),
    }
  }, [results])

  const scoreBuckets = useMemo(() => {
    const buckets = [
      { label: '0–25%',   min: 0,  max: 25,  count: 0 },
      { label: '25–50%',  min: 25, max: 50,  count: 0 },
      { label: '50–75%',  min: 50, max: 75,  count: 0 },
      { label: '75–100%', min: 75, max: 101, count: 0 },
    ]
    results.forEach((r) => {
      const pct = r.scores.final_score_pct
      const bucket = buckets.find((b) => pct >= b.min && pct < b.max)
      if (bucket) bucket.count++
    })
    return buckets
  }, [results])

  const recommendationData = useMemo(() => {
    const counts = {}
    results.forEach((r) => {
      const rec = r.scores.recommendation
      counts[rec] = (counts[rec] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [results])

  const missingSkillsData = useMemo(() => {
    const counts = {}
    results.forEach((r) => {
      r.skill_match.missing.forEach((skill) => {
        counts[skill] = (counts[skill] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }))
  }, [results])

  const subScoreData = useMemo(() => {
    if (!results.length) return []
    const avg = (key) =>
      Math.round((results.reduce((s, r) => s + r.scores[key], 0) / results.length) * 100)
    return [
      { subject: 'Semantic',   value: avg('semantic_score') },
      { subject: 'Skills',     value: avg('skill_score') },
      { subject: 'Experience', value: avg('experience_score') },
      { subject: 'Education',  value: avg('education_score') },
    ]
  }, [results])

  const educationData = useMemo(() => {
    const counts = {}
    results.forEach((r) => {
      const edu = r.education_label || 'Not detected'
      counts[edu] = (counts[edu] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [results])

  const EDU_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

  if (!results.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">Screen some resumes to see analytics.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* KPI cards */}
      <div>
        <SectionHeader title="Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Total Candidates" value={kpis.total} color="indigo" />
          <KpiCard label="Avg Score" value={`${kpis.avg}%`} sub="across all candidates" color="violet" />
          <KpiCard label="Strong Fit" value={`${kpis.strongFitPct}%`} sub="scored ≥ 75%" color="emerald" />
          <KpiCard label="Reachable" value={`${kpis.emailPct}%`} sub="have email on resume" color="amber" />
        </div>
      </div>

      {/* Score distribution + Recommendation breakdown */}
      <div>
        <SectionHeader title="Score Distribution" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <ChartCard title="Candidates by Score Range">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreBuckets} barCategoryGap="30%">
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]}>
                  {scoreBuckets.map((_, i) => (
                    <Cell key={i} fill={SCORE_BUCKET_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Recommendation Breakdown">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={recommendationData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {recommendationData.map((entry, i) => (
                    <Cell key={i} fill={RECOMMENDATION_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Sub-score radar + Education breakdown */}
      <div>
        <SectionHeader title="Score Breakdown" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <ChartCard title="Average Sub-scores">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={subScoreData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Avg %" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Education Level Distribution">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={educationData}
                  cx="50%" cy="50%"
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {educationData.map((_, i) => (
                    <Cell key={i} fill={EDU_COLORS[i % EDU_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Top missing skills */}
      {missingSkillsData.length > 0 && (
        <div>
          <SectionHeader title="Skill Gap Analysis" />
          <ChartCard title="Top 10 Missing Skills (across all candidates)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={missingSkillsData} layout="vertical" barCategoryGap="25%">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="skill" width={110} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="count" name="Candidates missing" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

    </div>
  )
}
