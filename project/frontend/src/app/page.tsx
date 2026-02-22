"use client"

import React, { useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calculator, Save, User, TrendingUp, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

const API = "http://localhost:8000"

const DEFAULT_DOMAINS = [
  { name: 'Output Quality', weight: 2, score: 8 },
  { name: 'Deadline Adherence', weight: 2, score: 8 },
  { name: 'Initiative', weight: 1, score: 8 },
  { name: 'Collaboration', weight: 1, score: 8 },
  { name: 'Technical Execution', weight: 3, score: 8 },
]

type Breakdown = {
  G: number; M: number; Pi2: number; sigma2: number;
  numerator: number; denominator: number; final_score: number;
}

export default function Dashboard() {
  const [domains, setDomains] = useState(DEFAULT_DOMAINS)
  const [T, setT] = useState(240)
  const [B, setB] = useState(3)
  const [W, setW] = useState(1)
  const [k1, setK1] = useState(0.05)
  const [ke, setKe] = useState(0.10)
  const [N, setN] = useState(1)
  const [D, setD] = useState(2)

  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)
  const [history, setHistory] = useState<{week: string; score: number}[]>([])
  const [loading, setLoading] = useState(false)
  const [commitStatus, setCommitStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')

  const buildPayload = () => ({
    T_minutes: T, B_days: B, W_weight: W,
    k1_bonus: k1, ke_bonus: ke,
    N_violations: N, D_severity: D,
    domains: domains.map(d => ({ name: d.name, weight: d.weight, score: d.score }))
  })

  const handleCompute = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
      })
      if (!res.ok) throw new Error()
      const data: Breakdown = await res.json()
      setBreakdown(data)
    } catch {
      alert("Backend not reachable. Is uvicorn running on port 8000?")
    } finally {
      setLoading(false)
    }
  }, [T, B, W, k1, ke, N, D, domains])

  const handleCommit = useCallback(async () => {
    if (!breakdown) { alert("Compute first!"); return }
    setCommitStatus('saving')
    try {
      const res = await fetch(`${API}/api/metrics?user_id=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
      })
      if (!res.ok) throw new Error()
      setCommitStatus('saved')
      // Refresh history
      fetchHistory()
      setTimeout(() => setCommitStatus('idle'), 3000)
    } catch {
      setCommitStatus('error')
      setTimeout(() => setCommitStatus('idle'), 3000)
    }
  }, [breakdown, T, B, W, k1, ke, N, D, domains])

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/metrics/1`)
      if (!res.ok) return
      const data = await res.json()
      setHistory(data.map((m: {week_date: string; computed_score: number}, i: number) => ({
        week: `W${i + 1}`,
        score: m.computed_score
      })))
    } catch { /* offline */ }
  }

  React.useEffect(() => { fetchHistory() }, [])

  const displayScore = breakdown?.final_score.toFixed(2) ?? "—"
  const chartData = history.length ? history : [
    { week: 'W1', score: 85 }, { week: 'W2', score: 92 }, { week: 'W3', score: 88 },
    { week: 'W4', score: 105 }, { week: 'W5', score: 110 },
  ]

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden p-6 gap-6 bg-[radial-gradient(ellipse_at_top,#1e3a5f30,transparent)]">

      {/* LEFT: Formula + Score + Graph */}
      <div className="flex flex-col gap-5 w-full md:w-80 shrink-0">
        {/* Core Formula */}
        <div className="panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="text-blue-400" size={16} />
            <h2 className="text-xs font-bold tracking-widest text-blue-400 uppercase">Core Engine</h2>
          </div>
          <div className="flex items-center justify-center p-5 bg-black/50 rounded-lg border border-white/5">
            <div className="text-center math-font">
              <div className="text-xl text-white/80">Score =</div>
              <div className="flex flex-col items-center mt-2">
                <div className="px-4 pb-1 border-b border-white/30 text-xl text-white">G · T · M · Π²</div>
                <div className="px-4 pt-1 text-lg text-white/60">(1 + σ²) · 1000</div>
              </div>
            </div>
          </div>
          {/* Breakdown */}
          {breakdown && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'G', value: breakdown.G },
                { label: 'M', value: breakdown.M },
                { label: 'Π²', value: breakdown.Pi2 },
                { label: 'σ²', value: breakdown.sigma2.toFixed(6) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded p-2 text-center">
                  <div className="text-white/40 text-xs">{label}</div>
                  <div className="font-mono text-sm text-white">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Score */}
        <div className="panel-border bg-gradient-to-br from-blue-950/60 to-black/60 rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-xs font-bold tracking-widest text-white/40 uppercase mb-2">Final Score</h2>
          <div className={`text-5xl font-black tracking-tighter ${breakdown ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400' : 'text-white/30'}`}>
            {displayScore}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCompute}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />}
              Compute
            </button>
            <button
              onClick={handleCommit}
              disabled={commitStatus === 'saving'}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-2 px-3 rounded border transition-colors ${
                commitStatus === 'saved' ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400' :
                commitStatus === 'error' ? 'bg-red-600/30 border-red-500 text-red-400' :
                'bg-white/5 border-white/20 text-white hover:bg-white/10'
              }`}
            >
              {commitStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> :
               commitStatus === 'saved' ? <CheckCircle size={14} /> :
               commitStatus === 'error' ? <AlertTriangle size={14} /> :
               <Save size={14} />}
              {commitStatus === 'saved' ? 'Saved!' : commitStatus === 'error' ? 'Failed' : 'Commit'}
            </button>
          </div>
        </div>

        {/* Trajectory */}
        <div className="panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md flex-1 min-h-[220px] flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-emerald-400" size={16} />
            <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Trajectory</h2>
            {history.length > 0 && <span className="text-xs text-white/30 ml-auto">{history.length} entries</span>}
          </div>
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} itemStyle={{ color: '#60A5FA' }} />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#0a0f1e', stroke: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#60A5FA' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CENTER: Operative & Domain Scores */}
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto min-w-0">
        {/* Operative header */}
        <div className="panel-border bg-black/40 rounded-xl p-4 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full"><User size={14} className="text-white/60" /></div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest">Active Operative</div>
              <div className="font-bold text-sm">Ash (Lead Engineer)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-widest">Evaluation Period</div>
            <div className="font-bold text-sm text-white">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* G: Domain Scores */}
        <div className="panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md flex-1">
          <h2 className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-1">G: Aggregate Domain Score</h2>
          <div className="text-xs text-white/40 mb-5 font-mono">G = Σ (d_i × w_i)</div>
          <div className="space-y-2">
            {domains.map((domain, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors border border-white/5">
                <div className="flex-1">
                  <div className="font-medium text-sm text-white/90">{domain.name}</div>
                  <div className="text-xs text-white/35">Weight: {domain.weight}x → contributes {(domain.score * domain.weight).toFixed(1)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="0" max="10" step="0.5"
                    value={domain.score}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0
                      setDomains(prev => prev.map((d, j) => j === i ? { ...d, score: Math.min(10, Math.max(0, v)) } : d))
                    }}
                    className="w-16 bg-black/60 border border-white/20 rounded p-1 text-center font-mono text-sm focus:border-blue-400 outline-none"
                  />
                  <span className="text-white/30 text-xs">/10</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-white/40 uppercase text-xs tracking-widest">Calculated G</span>
            <span className="font-mono text-xl text-blue-400 font-bold">
              {domains.reduce((sum, d) => sum + d.score * d.weight, 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Variable Panels */}
      <div className="w-full md:w-[300px] shrink-0 flex flex-col gap-4 overflow-y-auto">

        {/* T: Time */}
        <div className="panel-border bg-black/40 rounded-xl p-4 backdrop-blur-md">
          <h2 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-3">T: Time Invested</h2>
          <div className="flex items-center gap-3">
            <input type="number" value={T} onChange={e => setT(parseInt(e.target.value) || 0)}
              className="flex-1 bg-black/50 border border-white/20 rounded p-2 text-right font-mono text-lg focus:border-blue-400 outline-none" />
            <span className="text-white/40 text-xs font-bold uppercase">min</span>
          </div>
        </div>

        {/* M: Bonus */}
        <div className="panel-border bg-black/40 rounded-xl p-4 backdrop-blur-md border-l-2 border-l-emerald-600">
          <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-1">M: Bonus Quotient</h2>
          <div className="text-xs text-white/40 mb-3 font-mono">M = 1 + k₁ + kₑ = {(1 + k1 + ke).toFixed(2)}</div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">k₁ — Discipline Factor</label>
              <input type="number" step="0.01" value={k1} onChange={e => setK1(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/50 border border-white/20 rounded p-2 font-mono text-sm focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">kₑ — Exceptional Performance</label>
              <input type="number" step="0.01" value={ke} onChange={e => setKe(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/50 border border-white/20 rounded p-2 font-mono text-sm focus:border-emerald-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Pi^2 */}
        <div className="panel-border bg-black/40 rounded-xl p-4 backdrop-blur-md border-l-2 border-l-blue-600">
          <h2 className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-1">Π²: Priority Intensity</h2>
          <div className="text-xs text-white/40 mb-3 font-mono">Π² = (B·W)² = {((B * W) ** 2).toFixed(0)}</div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/50 mb-1 block">B (Days)</label>
              <input type="number" value={B} onChange={e => setB(parseInt(e.target.value) || 0)}
                className="w-full bg-black/50 border border-white/20 rounded p-2 text-center font-mono text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="flex items-end pb-2 text-white/30 font-bold">×</div>
            <div className="flex-1">
              <label className="text-xs text-white/50 mb-1 block">W (Weight)</label>
              <input type="number" value={W} onChange={e => setW(parseFloat(e.target.value) || 1)}
                className="w-full bg-black/50 border border-white/20 rounded p-2 text-center font-mono text-sm focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Sigma^2 */}
        <div className="panel-border bg-black/40 rounded-xl p-4 backdrop-blur-md border-l-2 border-l-red-600">
          <h2 className="text-xs font-bold tracking-widest text-red-500 uppercase mb-1">σ²: Penalty Index</h2>
          <div className="text-xs text-white/40 mb-3 font-mono">σ² = (N·D·κ)² = {((N * D * 0.28572) ** 2).toFixed(4)}</div>
          <div className="flex gap-3 mb-2">
            <div className="flex-1">
              <label className="text-xs text-white/50 mb-1 block">Violations (N)</label>
              <input type="number" value={N} onChange={e => setN(parseInt(e.target.value) || 0)}
                className="w-full bg-red-950/30 border border-red-500/30 rounded p-2 text-center text-red-100 font-mono text-sm focus:border-red-500 outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-white/50 mb-1 block">Severity (D)</label>
              <input type="number" value={D} onChange={e => setD(parseFloat(e.target.value) || 0)}
                className="w-full bg-red-950/30 border border-red-500/30 rounded p-2 text-center text-red-100 font-mono text-sm focus:border-red-500 outline-none" />
            </div>
          </div>
          <div className="text-xs text-red-400/60 border-t border-red-500/20 pt-2">κ = 0.28572 (constant)</div>
        </div>

      </div>
    </div>
  )
}
