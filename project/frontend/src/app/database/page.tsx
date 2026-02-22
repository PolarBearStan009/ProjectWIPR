"use client"

import React, { useState, useEffect } from 'react'
import { Database, Trophy, RefreshCw, UserPlus } from 'lucide-react'

const API = "http://localhost:8000"

type RawMetric = {
  id: number
  user_name: string
  week_date: string
  computed_score: number
  T_minutes: number
  N_violations: number
}

type LeaderboardEntry = {
  user_id: number
  name: string
  role: string
  latest_score: number | null
  total_entries: number
}

export default function DatabasePage() {
  const [metrics, setMetrics] = useState<RawMetric[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState('Staff')
  const [addingUser, setAddingUser] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [allRes, boardRes] = await Promise.all([
        fetch(`${API}/api/all_metrics`),
        fetch(`${API}/api/leaderboard`)
      ])
      if (allRes.ok) setMetrics(await allRes.json())
      if (boardRes.ok) setLeaderboard(await boardRes.json())
    } catch { /* offline */ }
    finally { setLoading(false) }
  }

  const handleAddUser = async () => {
    if (!newUserName.trim()) return
    setAddingUser(true)
    try {
      await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName.trim(), role: newUserRole })
      })
      setNewUserName('')
      fetchData()
    } catch { /* offline */ }
    finally { setAddingUser(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Database</h1>
          <p className="text-sm text-white/40">Raw records and user management</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-white/50 hover:text-white border border-white/10 rounded px-3 py-1.5 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-white/30">Loading...</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Leaderboard + Add User */}
          <div className="flex flex-col gap-4 w-full lg:w-72">
            {/* Leaderboard */}
            <div className="panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-yellow-400" size={16} />
                <h2 className="text-xs font-bold tracking-widest text-yellow-400 uppercase">Leaderboard</h2>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-4">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((u, i) => (
                    <div key={u.user_id} className="flex items-center gap-3 p-2 rounded bg-white/5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white/40'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{u.name}</div>
                        <div className="text-xs text-white/30">{u.role} · {u.total_entries} entries</div>
                      </div>
                      <div className="font-mono text-sm font-bold text-blue-400">
                        {u.latest_score !== null ? u.latest_score.toFixed(1) : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add User */}
            <div className="panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus size={16} className="text-white/50" />
                <h2 className="text-xs font-bold tracking-widest text-white/50 uppercase">Add Operative</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text" placeholder="Full Name" value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm focus:border-blue-400 outline-none"
                />
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm focus:border-blue-400 outline-none">
                  <option>Staff</option>
                  <option>Engineer</option>
                  <option>Lead Engineer</option>
                  <option>Manager</option>
                  <option>Director</option>
                </select>
                <button
                  onClick={handleAddUser} disabled={addingUser || !newUserName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors disabled:opacity-40"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Raw Table */}
          <div className="flex-1 panel-border bg-black/40 rounded-xl p-5 backdrop-blur-md overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <Database size={16} className="text-white/50" />
              <h2 className="text-xs font-bold tracking-widest text-white/50 uppercase">weekly_metrics Table</h2>
              <span className="ml-auto text-xs text-white/30">{metrics.length} rows</span>
            </div>
            {metrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/30 gap-2">
                <Database size={32} />
                <p>No records yet. Commit a score from the Home tab.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    {['ID', 'User', 'Date', 'Score', 'Time (min)', 'Violations'].map(h => (
                      <th key={h} className="py-2 px-3 text-xs uppercase tracking-wider text-white/30 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 font-mono text-white/40 text-xs">#{m.id}</td>
                      <td className="py-2 px-3 font-medium">{m.user_name}</td>
                      <td className="py-2 px-3 text-white/50 text-xs">{new Date(m.week_date).toLocaleDateString()}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-400">{m.computed_score.toFixed(2)}</td>
                      <td className="py-2 px-3 text-white/60 font-mono">{m.T_minutes}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.N_violations === 0 ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                          {m.N_violations}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
