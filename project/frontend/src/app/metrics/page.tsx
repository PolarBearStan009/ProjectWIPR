"use client"

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, RefreshCw } from 'lucide-react'

const API = "http://localhost:8000"

type Metric = {
  id: number
  week_date: string
  computed_score: number
  T_minutes: number
  B_days: number
  W_weight: number
  k1_bonus: number
  ke_bonus: number
  N_violations: number
  D_severity: number
  domains: { name: string; weight: number; score: number }[]
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [selected, setSelected] = useState<Metric | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/metrics/1`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
        if (data.length > 0) setSelected(data[data.length - 1])
      }
    } catch { /* offline */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMetrics() }, [])

  const chartData = metrics.map((m, i) => ({
    week: `W${i + 1}`,
    score: m.computed_score,
    label: new Date(m.week_date).toLocaleDateString()
  }))

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Metrics — Performance History</h1>
          <p className="text-sm text-white/40">All committed evaluations for Ash (User 1)</p>
        </div>
        <button onClick={fetchMetrics} className="flex items-center gap-2 text-sm text-white/50 hover:text-white border border-white/10 rounded px-3 py-1.5 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-white/30">Loading...</div>
      ) : metrics.length === 0 ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 text-white/30">
          <TrendingUp size={40} />
          <p>No committed metrics yet.</p>
          <p className="text-sm">Go to the Home tab, fill in values, click <strong>Compute</strong> then <strong>Commit</strong>.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Chart */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md" style={{ minHeight: 280 }}>
              <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-4">Score Trajectory</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }}
                    itemStyle={{ color: '#60A5FA' }}
                    formatter={(v: number | undefined) => [typeof v === 'number' ? v.toFixed(2) : '—', 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#0a0f1e', stroke: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#60A5FA' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Domain breakdown of selected entry */}
            {selected && selected.domains.length > 0 && (
              <div className="panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md" style={{ minHeight: 240 }}>
                <h2 className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-4">
                  Domain Breakdown — {new Date(selected.week_date).toLocaleDateString()}
                </h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={selected.domains} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" domain={[0, 10]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={130} />
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} itemStyle={{ color: '#60A5FA' }} />
                    <Bar dataKey="score" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Entry list */}
          <div className="w-full lg:w-80 flex flex-col gap-3 overflow-y-auto">
            <h2 className="text-xs font-bold tracking-widest text-white/40 uppercase">All Entries</h2>
            {[...metrics].reverse().map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`panel-border rounded-xl p-4 text-left transition-all ${selected?.id === m.id ? 'border-blue-500/40 bg-blue-900/20' : 'bg-black/40 hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">{new Date(m.week_date).toLocaleDateString()}</span>
                  <span className={`font-mono font-bold text-lg ${m.computed_score > 100 ? 'text-emerald-400' : m.computed_score > 50 ? 'text-blue-400' : 'text-orange-400'}`}>
                    {m.computed_score.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-white/30 mt-1">T: {m.T_minutes}min · N: {m.N_violations} violations</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
