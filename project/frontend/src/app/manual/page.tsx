import React from 'react'
import { BookOpen } from 'lucide-react'

export default function ManualPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="text-white/40" size={24} />
          <div>
            <h1 className="text-xl font-bold text-white">WIPR Manual</h1>
            <p className="text-sm text-white/40">Weighted Individual Performance Rating — System Documentation</p>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="What is WIPR?">
            <p className="text-white/60 leading-relaxed">
              WIPR (Weighted Individual Performance Rating) is a mathematically rigorous, multi-factor performance scoring framework.
              It quantifies contribution using weighted domains, effort tracking, bonus multipliers, strategic alignment intensity, 
              and strict penalty enforcement. The system is transparent, auditable, and mathematically consistent.
            </p>
          </Section>

          <Section title="Core Formula">
            <div className="bg-black/60 rounded-xl p-6 text-center border border-white/10 math-font">
              <div className="text-2xl text-white/80 mb-2">Score =</div>
              <div className="inline-flex flex-col items-center">
                <div className="px-6 pb-2 border-b-2 border-white/30 text-3xl text-white">G · T · M · Π²</div>
                <div className="px-6 pt-2 text-2xl text-white/60">(1 + σ²) · 1000</div>
              </div>
            </div>
          </Section>

          <Section title="Variable Definitions">
            <div className="space-y-4">
              <Variable
                symbol="G" name="Aggregate Domain Score"
                formula="G = Σ (dᵢ × wᵢ)"
                description="Sum of all domain scores multiplied by their respective weights. Each domain is scored 0–10 and given a weight reflecting its importance."
                color="blue"
              />
              <Variable
                symbol="T" name="Time Invested"
                formula="T = minutes"
                description="Actual minutes of dedicated productive effort during the evaluation period. More committed time directly amplifies the score."
                color="white"
              />
              <Variable
                symbol="M" name="Bonus Quotient"
                formula="M = 1 + k₁ + kₑ + ..."
                description="A multiplicative reward layer. k₁ is the Discipline Factor, kₑ is the Exceptional Performance Factor. Additional bonuses can be stacked."
                color="emerald"
              />
              <Variable
                symbol="Π²" name="Priority Intensity Index"
                formula="Π² = (B × W)²"
                description="Measures sustained, focused effort. B = days dedicated to a specific skill/task. W = weight of that skill. Squaring strongly rewards deep focus."
                color="blue"
              />
              <Variable
                symbol="σ²" name="Penalty Index"
                formula="σ² = (N × D × κ)²"
                description="Quantifies misconduct impact. N = number of violations, D = severity index (1–5), κ = 0.28572 (constant). Penalties are squared for strict enforcement."
                color="red"
              />
              <Variable
                symbol="1000" name="Normalization Constant"
                formula="÷ 1000"
                description="Divides the raw score to keep values in a human-readable range (typically 0–500)."
                color="white"
              />
            </div>
          </Section>

          <Section title="Worked Example">
            <div className="bg-black/40 rounded-xl p-5 border border-white/10 space-y-3 font-mono text-sm">
              <Line_ label="Domain Scores" value="G = 12+14+8+5+27 = 66" />
              <Line_ label="T (Time)" value="240 minutes" />
              <Line_ label="M (Bonus)" value="1 + 0.05 + 0.10 = 1.15" />
              <Line_ label="Π² (Priority)" value="(3×1)² = 9" />
              <Line_ label="σ² (Penalty)" value="(1×2×0.28572)² ≈ 0.3265" />
              <div className="border-t border-white/10 pt-3">
                <Line_ label="Numerator" value="66 × 240 × 1.15 × 9 = 163,944" />
                <Line_ label="Denominator" value="(1 + 0.3265) × 1000 = 1326.54" />
                <div className="mt-2 text-blue-400 font-bold text-base">Score ≈ 123.61</div>
              </div>
            </div>
          </Section>

          <Section title="Safety & Validation">
            <ul className="space-y-2 text-white/60 text-sm list-disc list-inside">
              <li>Enforce max days per period to prevent Π² inflation</li>
              <li>Cap weekly minutes to reflect real working hours</li>
              <li>Limit bonus factor stacking</li>
              <li>Validate severity levels (D = 1–5 only)</li>
              <li>Monitor for extreme score spikes week-over-week</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-border bg-black/40 rounded-xl p-6 backdrop-blur-md">
      <h2 className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Variable({ symbol, name, formula, description, color }: {
  symbol: string; name: string; formula: string; description: string; color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 border-blue-600',
    emerald: 'text-emerald-400 border-emerald-600',
    red: 'text-red-400 border-red-700',
    white: 'text-white/70 border-white/20',
  }
  return (
    <div className={`border-l-2 pl-4 ${colorMap[color]}`}>
      <div className="flex items-baseline gap-3 mb-1">
        <span className={`font-mono font-black text-lg ${colorMap[color].split(' ')[0]}`}>{symbol}</span>
        <span className="text-white/80 font-medium text-sm">{name}</span>
        <span className="font-mono text-xs text-white/30 ml-auto">{formula}</span>
      </div>
      <p className="text-xs text-white/50 leading-relaxed">{description}</p>
    </div>
  )
}

function Line_({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  )
}
