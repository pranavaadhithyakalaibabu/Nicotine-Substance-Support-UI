import { useId, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Bell,
  Calendar,
  ChevronRight,
  HeartPulse,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  Shield,
  Stethoscope,
  ThermometerSun,
  X,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type NavKey = 'overview' | 'care' | 'trigger' | 'biomarkers' | 'telehealth' | 'settings'

function SidebarContent(props: {
  activeNav: NavKey
  setActiveNav: (k: NavKey) => void
  activeNavId: string
  onNavigate?: () => void
}) {
  const { activeNav, setActiveNav, activeNavId, onNavigate } = props

  function go(k: NavKey) {
    setActiveNav(k)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
            <HeartPulse className="h-4 w-4 text-white/75" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Pulse</p>
            <p className="muted text-xs">Recovery Platform</p>
          </div>
        </div>
      </div>

      <nav className="px-3" aria-label="Primary navigation">
        <ul className="flex flex-col gap-1">
          <li>
            <button
              type="button"
              className={cx('sidebarItem', activeNav === 'overview' && 'sidebarItemActive')}
              onClick={() => go('overview')}
              aria-current={activeNav === 'overview' ? 'page' : undefined}
              aria-describedby={activeNavId}
            >
              <Home className="icon" aria-hidden="true" />
              Overview
            </button>
          </li>
          <li>
            <button
              type="button"
              className={cx('sidebarItem', activeNav === 'care' && 'sidebarItemActive')}
              onClick={() => go('care')}
              aria-current={activeNav === 'care' ? 'page' : undefined}
            >
              <Activity className="icon" aria-hidden="true" />
              Care Plan
            </button>
          </li>
          <li>
            <button
              type="button"
              className={cx('sidebarItem', activeNav === 'trigger' && 'sidebarItemActive')}
              onClick={() => go('trigger')}
              aria-current={activeNav === 'trigger' ? 'page' : undefined}
            >
              <ThermometerSun className="icon" aria-hidden="true" />
              Trigger Log
            </button>
          </li>
          <li>
            <button
              type="button"
              className={cx('sidebarItem', activeNav === 'biomarkers' && 'sidebarItemActive')}
              onClick={() => go('biomarkers')}
              aria-current={activeNav === 'biomarkers' ? 'page' : undefined}
            >
              <HeartPulse className="icon" aria-hidden="true" />
              Biomarkers
            </button>
          </li>
          <li>
            <button
              type="button"
              className={cx('sidebarItem', activeNav === 'telehealth' && 'sidebarItemActive')}
              onClick={() => go('telehealth')}
              aria-current={activeNav === 'telehealth' ? 'page' : undefined}
            >
              <Stethoscope className="icon" aria-hidden="true" />
              Telehealth
            </button>
          </li>
          <li>
            <button
              type="button"
              className={cx('sidebarItem', activeNav === 'settings' && 'sidebarItemActive')}
              onClick={() => go('settings')}
              aria-current={activeNav === 'settings' ? 'page' : undefined}
            >
              <Settings className="icon" aria-hidden="true" />
              Settings
            </button>
          </li>
        </ul>
        <p id={activeNavId} className="sr-only">
          Navigation
        </p>
      </nav>

      <div className="mt-auto px-3 pb-5 pt-4">
        <div className="card px-3 py-3">
          <p className="text-sm font-semibold text-white">Care Team</p>
          <p className="muted mt-1 text-xs">Next session: Thu, 10:30</p>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              className="focusRing inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/[0.06]"
            >
              <LifeBuoy className="h-4 w-4 text-white/70" aria-hidden="true" />
              Resources
            </button>
            <button
              type="button"
              className="focusRing inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.06]"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4 text-white/60" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewView(props: {
  copilotLabelId: string
  copilotDraft: string
  setCopilotDraft: (v: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  cravingSeries: Array<{ time: string; intensity: number }>
  heatmap: {
    dayLabels: string[]
    timeBins: string[]
    max: number
    cells: Array<Array<{ key: string; value: number; day: string; bin: string }>>
  }
  pushToast: (message: string) => void
  runQuickAction: (action: 'craving' | 'breathing' | 'support') => void
}) {
  const { copilotLabelId, copilotDraft, setCopilotDraft, inputRef, cravingSeries, heatmap, pushToast, runQuickAction } =
    props

  return (
    <>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12" aria-label="Key metrics">
        <div className="card md:col-span-2 lg:col-span-5">
          <div className="cardBody">
            <p className="muted text-xs">Sober Streak</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold tracking-tight text-white">14</p>
              <p className="muted text-sm">Days</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="pill">Stable</span>
              <span className="muted text-xs">Last update 09:10</span>
            </div>
          </div>
        </div>

        <div className="card md:col-span-1 lg:col-span-4">
          <div className="cardBody">
            <p className="muted text-xs">Time Reclaimed</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold tracking-tight text-white">336</p>
              <p className="muted text-sm">Hours</p>
            </div>
            <p className="muted mt-3 text-xs">Estimated from baseline usage patterns.</p>
          </div>
        </div>

        <div className="card md:col-span-1 lg:col-span-3">
          <div className="cardBody">
            <p className="muted text-xs">Financial Savings</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold tracking-tight text-white">$182</p>
              <p className="muted text-sm">To date</p>
            </div>
            <p className="muted mt-3 text-xs">Based on user-entered cost assumptions.</p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 lg:col-span-7">
          <section className="card">
            <div className="cardHeader">
              <div>
                <h2 className="text-sm font-semibold text-white">Craving Intensity vs. Time</h2>
                <p className="muted mt-1 text-xs">Smooth trendline with gradient area.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="pill">Last 24h</span>
                <span className="pill">0–10</span>
              </div>
            </div>
            <div className="cardBody">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cravingSeries} margin={{ left: 6, right: 10, top: 6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emeraldFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
                        <stop offset="55%" stopColor="rgba(16,185,129,0.12)" />
                        <stop offset="100%" stopColor="rgba(16,185,129,0.0)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tickCount={6}
                      tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(11,15,20,0.88)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 14,
                        color: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 20px 60px -40px rgba(0,0,0,0.9)',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.65)' }}
                      formatter={(value) => [`${value}`, 'Intensity']}
                    />
                    <Area
                      type="monotone"
                      dataKey="intensity"
                      stroke="rgba(16,185,129,0.85)"
                      strokeWidth={2.25}
                      fill="url(#emeraldFill)"
                      dot={false}
                      activeDot={{ r: 4, stroke: 'rgba(16,185,129,0.95)', fill: '#0B0F14' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="muted text-xs">Peak</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {Math.max(...cravingSeries.map((d) => d.intensity))}/10
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="muted text-xs">Current</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {cravingSeries.at(-1)?.intensity ?? 0}/10
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="muted text-xs">Avg</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {Math.round((cravingSeries.reduce((a, b) => a + b.intensity, 0) / cravingSeries.length) * 10) / 10}/10
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="cardHeader">
              <div>
                <h2 className="text-sm font-semibold text-white">Trigger Heatmap</h2>
                <p className="muted mt-1 text-xs">Frequency by time of day across the week.</p>
              </div>
              <span className="pill">Week view</span>
            </div>
            <div className="cardBody">
              <div className="grid grid-cols-[42px_1fr] gap-3">
                <div className="grid grid-rows-7 gap-2 pt-6">
                  {heatmap.dayLabels.map((d) => (
                    <div key={d} className="muted text-xs leading-5" aria-hidden="true">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="grid grid-cols-6 gap-2">
                    {heatmap.timeBins.map((t) => (
                      <div key={t} className="muted text-[11px]">
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-rows-7 gap-2">
                    {heatmap.cells.map((row) => (
                      <div key={row[0]?.key} className="grid grid-cols-6 gap-2">
                        {row.map((cell) => {
                          const a = heatmap.max ? cell.value / heatmap.max : 0
                          const bg = `rgba(16,185,129,${0.06 + a * 0.26})`
                          return (
                            <div
                              key={cell.key}
                              className="focusRing h-8 rounded-xl border border-white/[0.08]"
                              style={{ background: bg }}
                              role="img"
                              aria-label={`${cell.day}, ${cell.bin}: ${cell.value} events`}
                              title={`${cell.day} ${cell.bin} — ${cell.value}`}
                              tabIndex={0}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="muted mt-4 text-xs">Higher saturation indicates more frequent cravings.</p>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <section className="card">
            <div className="cardHeader">
              <div>
                <h2 className="text-sm font-semibold text-white">Clinical Copilot</h2>
                <p className="muted mt-1 text-xs">Structured clinical check-in and action routing.</p>
              </div>
              <span className="pill">Private</span>
            </div>
            <div className="cardBody">
              <div>
                <label id={copilotLabelId} className="muted mb-2 block text-xs">
                  Current state
                </label>
                <input
                  ref={inputRef}
                  value={copilotDraft}
                  onChange={(e) => setCopilotDraft(e.target.value)}
                  className="focusRing w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-white/35"
                  placeholder="Craving intensity 0–10, trigger, location, and intent."
                  aria-labelledby={copilotLabelId}
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="muted text-xs">Routed to your care plan and trigger log.</p>
                  <button
                    type="button"
                    className="focusRing inline-flex items-center justify-center rounded-xl bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-[0_0_0_1px_rgba(0,0,0,0.18)] transition hover:bg-emerald-400/95 active:bg-emerald-500 disabled:opacity-50"
                    onClick={() => pushToast('Check-in saved to your clinical timeline.')}
                    disabled={!copilotDraft.trim()}
                  >
                    Save check-in
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <p className="muted text-xs">Quick Actions</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => runQuickAction('craving')}
                    className="focusRing inline-flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/[0.06]"
                  >
                    <span className="inline-flex items-center gap-3">
                      <ThermometerSun className="h-4 w-4 text-white/60" aria-hidden="true" />
                      Log a Craving
                    </span>
                    <span className="muted text-xs">Trigger Log</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runQuickAction('breathing')}
                    className="focusRing inline-flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/[0.06]"
                  >
                    <span className="inline-flex items-center gap-3">
                      <Activity className="h-4 w-4 text-white/60" aria-hidden="true" />
                      Start Breathing Exercise
                    </span>
                    <span className="muted text-xs">2 min</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runQuickAction('support')}
                    className="focusRing inline-flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/[0.06]"
                  >
                    <span className="inline-flex items-center gap-3">
                      <LifeBuoy className="h-4 w-4 text-white/60" aria-hidden="true" />
                      Request Support
                    </span>
                    <span className="muted text-xs">Care team</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <p className="text-xs font-semibold text-white/85">Clinical note</p>
                <p className="muted mt-1 text-xs leading-relaxed">
                  If cravings spike alongside elevated stress, prioritize short regulation loops (breathing, hydration, walk) before cognitive work.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </>
  )
}

function PlaceholderShell(props: {
  title: string
  subtitle: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-balance text-xl font-semibold tracking-tight text-white">{props.title}</h1>
          <p className="muted mt-1 text-sm">{props.subtitle}</p>
        </div>
        {props.right ? <div className="flex items-center gap-2">{props.right}</div> : null}
      </header>
      {props.children}
    </div>
  )
}

function CarePlanView() {
  const protocols = [
    { time: 'Morning', title: 'Hydration + protein-forward breakfast', detail: 'Stabilize baseline energy and reduce irritability.' },
    { time: 'Midday', title: '10-minute walk + sunlight exposure', detail: 'Reduce stress load and improve sleep pressure.' },
    { time: 'Afternoon', title: 'Trigger rehearsal', detail: 'Identify one expected trigger and plan a 2-step response.' },
    { time: 'Evening', title: 'Wind-down protocol', detail: 'Low light, device boundary, and 5-minute reflection.' },
  ]

  return (
    <PlaceholderShell
      title="Care Plan"
      subtitle="Daily protocols and next-best actions aligned to your recovery plan."
      right={<span className="pill">Today</span>}
    >
      <section className="card">
        <div className="cardHeader">
          <div>
            <h2 className="text-sm font-semibold text-white">Daily Protocols</h2>
            <p className="muted mt-1 text-xs">Actionable structure with low cognitive load.</p>
          </div>
          <button className="focusRing rounded-xl bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400/95">
            Mark day started
          </button>
        </div>
        <div className="cardBody">
          <ol className="space-y-3">
            {protocols.map((p) => (
              <li key={p.time} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="muted text-xs">{p.time}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{p.title}</p>
                    <p className="muted mt-1 text-xs">{p.detail}</p>
                  </div>
                  <button className="focusRing inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/[0.06]">
                    Review
                    <ChevronRight className="h-4 w-4 text-white/50" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PlaceholderShell>
  )
}

function TriggerLogView() {
  const rows = [
    { t: 'Today 09:18', trigger: 'Commute', intensity: 6, context: 'Crowded train, low sleep' },
    { t: 'Yesterday 18:42', trigger: 'Work stress', intensity: 7, context: 'Deadline pressure, skipped lunch' },
    { t: 'Yesterday 12:10', trigger: 'Social', intensity: 4, context: 'Friend group, cravings cue' },
  ]

  return (
    <PlaceholderShell
      title="Trigger Log"
      subtitle="Track triggers with clinical clarity and review trends over time."
      right={
        <>
          <span className="pill">Last 7 days</span>
          <button className="focusRing rounded-xl bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400/95">
            New entry
          </button>
        </>
      }
    >
      <section className="card">
        <div className="cardHeader">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent entries</h2>
            <p className="muted mt-1 text-xs">Timestamp, trigger, intensity, and context.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill">Filter: All</span>
            <span className="pill">Sort: Recent</span>
          </div>
        </div>
        <div className="cardBody">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="muted text-[11px]">
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Trigger</th>
                  <th className="px-3 py-2 font-medium">Intensity</th>
                  <th className="px-3 py-2 font-medium">Context</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.t} className="rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                    <td className="px-3 py-3 text-xs text-white/80">{r.t}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-white">{r.trigger}</td>
                    <td className="px-3 py-3">
                      <span className="pill">{r.intensity}/10</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-white/70">{r.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PlaceholderShell>
  )
}

function BiomarkersView() {
  const metrics = [
    { label: 'Resting HR', value: '62 bpm', note: '7-day median' },
    { label: 'Sleep', value: '7.1 h', note: 'Last night' },
    { label: 'HRV', value: '54 ms', note: 'Baseline trend' },
  ]

  return (
    <PlaceholderShell
      title="Biomarkers"
      subtitle="Physiology signals correlated with cravings, sleep, and stress load."
      right={<span className="pill">Synced</span>}
    >
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="card lg:col-span-8">
          <div className="cardHeader">
            <div>
              <h2 className="text-sm font-semibold text-white">Key signals</h2>
              <p className="muted mt-1 text-xs">High-level indicators for clinical context.</p>
            </div>
            <span className="pill">Last 14 days</span>
          </div>
          <div className="cardBody">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                  <p className="muted text-xs">{m.label}</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-white">{m.value}</p>
                  <p className="muted mt-1 text-xs">{m.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="text-xs font-semibold text-white/85">Correlation snapshot</p>
              <p className="muted mt-1 text-xs leading-relaxed">
                Higher stress load and shorter sleep windows typically precede higher craving intensity. Use short regulation loops before exposure to known triggers.
              </p>
            </div>
          </div>
        </div>
        <div className="card lg:col-span-4">
          <div className="cardHeader">
            <div>
              <h2 className="text-sm font-semibold text-white">Data sources</h2>
              <p className="muted mt-1 text-xs">Connected devices and health apps.</p>
            </div>
            <Shield className="h-4 w-4 text-white/60" aria-hidden="true" />
          </div>
          <div className="cardBody space-y-2">
            {['Apple Health', 'Wearable', 'Manual entries'].map((s) => (
              <div key={s} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <p className="text-sm font-medium text-white/85">{s}</p>
                <span className="pill">Connected</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PlaceholderShell>
  )
}

function TelehealthView() {
  const appts = [
    { date: 'Thu, 10:30', clinician: 'Dr. Patel', specialty: 'Addiction Medicine', mode: 'Video' },
    { date: 'Mon, 16:00', clinician: 'Morgan Lee, LCSW', specialty: 'Therapy', mode: 'Video' },
  ]

  return (
    <PlaceholderShell
      title="Telehealth"
      subtitle="Upcoming appointments, secure messages, and care coordination."
      right={
        <button className="focusRing inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400/95">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Schedule
        </button>
      }
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="card lg:col-span-8">
          <div className="cardHeader">
            <div>
              <h2 className="text-sm font-semibold text-white">Upcoming</h2>
              <p className="muted mt-1 text-xs">Join sessions and review prep notes.</p>
            </div>
            <span className="pill">Secure</span>
          </div>
          <div className="cardBody space-y-3">
            {appts.map((a) => (
              <div key={a.date} className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="muted text-xs">{a.date}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {a.clinician}{' '}
                    <span className="muted font-medium">· {a.specialty}</span>
                  </p>
                  <p className="muted mt-1 text-xs">Mode: {a.mode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="focusRing rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/[0.06]">
                    Details
                  </button>
                  <button className="focusRing rounded-xl bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400/95">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card lg:col-span-4">
          <div className="cardHeader">
            <div>
              <h2 className="text-sm font-semibold text-white">Care messages</h2>
              <p className="muted mt-1 text-xs">Clinical-grade async communication.</p>
            </div>
            <span className="pill">Inbox</span>
          </div>
          <div className="cardBody">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="text-sm font-semibold text-white/90">No new messages</p>
              <p className="muted mt-1 text-xs">
                Messages from your care team will appear here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PlaceholderShell>
  )
}

function SettingsView() {
  const [toggles, setToggles] = useState({
    sensitiveLock: true,
    cravingReminders: true,
    careTeamNotifications: true,
  })

  function Toggle(props: {
    label: string
    description: string
    checked: boolean
    onChange: (next: boolean) => void
  }) {
    return (
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white/90">{props.label}</p>
          <p className="muted mt-1 text-xs">{props.description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={props.checked}
          onClick={() => props.onChange(!props.checked)}
          className={cx(
            'focusRing relative inline-flex h-7 w-12 flex-none items-center rounded-full border transition-colors',
            props.checked
              ? 'border-emerald-400/30 bg-emerald-500/70'
              : 'border-white/[0.10] bg-white/[0.06]'
          )}
        >
          <span
            className={cx(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_6px_18px_-12px_rgba(0,0,0,0.9)] transition-transform duration-200',
              props.checked ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    )
  }

  return (
    <PlaceholderShell
      title="Settings"
      subtitle="Privacy, notifications, and account preferences."
      right={<span className="pill">Account</span>}
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="card lg:col-span-7">
          <div className="cardHeader">
            <div>
              <h2 className="text-sm font-semibold text-white">Preferences</h2>
              <p className="muted mt-1 text-xs">Controls designed for clarity and trust.</p>
            </div>
            <Shield className="h-4 w-4 text-white/60" aria-hidden="true" />
          </div>
          <div className="cardBody space-y-3">
            <Toggle
              label="Sensitive content lock"
              description="Require device auth for clinical notes."
              checked={toggles.sensitiveLock}
              onChange={(next) => setToggles((p) => ({ ...p, sensitiveLock: next }))}
            />
            <Toggle
              label="Craving reminders"
              description="Prompt a brief log during high-risk windows."
              checked={toggles.cravingReminders}
              onChange={(next) => setToggles((p) => ({ ...p, cravingReminders: next }))}
            />
            <Toggle
              label="Care team notifications"
              description="Alerts for support replies and appointments."
              checked={toggles.careTeamNotifications}
              onChange={(next) => setToggles((p) => ({ ...p, careTeamNotifications: next }))}
            />
          </div>
        </div>
        <div className="card lg:col-span-5">
          <div className="cardHeader">
            <div>
              <h2 className="text-sm font-semibold text-white">Data & privacy</h2>
              <p className="muted mt-1 text-xs">Export, retention, and permissions.</p>
            </div>
            <span className="pill">Protected</span>
          </div>
          <div className="cardBody space-y-2">
            <button className="focusRing w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white/85 hover:bg-white/[0.06]">
              Export recovery data
              <p className="muted mt-1 text-xs font-normal">Download logs and summaries as JSON.</p>
            </button>
            <button className="focusRing w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white/85 hover:bg-white/[0.06]">
              Manage device access
              <p className="muted mt-1 text-xs font-normal">Review connected devices and sessions.</p>
            </button>
          </div>
        </div>
      </section>
    </PlaceholderShell>
  )
}

export default function App() {
  const activeNavId = useId()
  const copilotLabelId = useId()
  const [activeNav, setActiveNav] = useState<NavKey>('overview')
  const [toast, setToast] = useState<string>('')
  const [copilotDraft, setCopilotDraft] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const cravingSeries = useMemo(() => {
    const labels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
    const values = [2, 1, 1, 3, 5, 4, 3, 4, 6, 7, 5, 3]
    return labels.map((t, i) => ({ time: t, intensity: clamp(values[i] ?? 0, 0, 10) }))
  }, [])

  const heatmap = useMemo(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const timeBins = ['0–4', '4–8', '8–12', '12–16', '16–20', '20–24']
    const raw: number[][] = [
      [1, 0, 2, 1, 3, 2],
      [0, 1, 1, 2, 2, 3],
      [1, 1, 2, 2, 4, 3],
      [0, 2, 1, 3, 3, 4],
      [1, 1, 2, 3, 5, 4],
      [0, 1, 1, 2, 3, 5],
      [0, 0, 1, 1, 2, 3],
    ]
    const max = Math.max(...raw.flat())
    return {
      dayLabels,
      timeBins,
      max,
      cells: raw.map((row, r) =>
        row.map((v, c) => ({
          key: `${r}-${c}`,
          value: v,
          day: dayLabels[r] ?? '',
          bin: timeBins[c] ?? '',
        }))
      ),
    }
  }, [])

  function pushToast(message: string) {
    setToast(message)
    window.clearTimeout((pushToast as any)._t)
    ;(pushToast as any)._t = window.setTimeout(() => setToast(''), 2200)
  }

  function runQuickAction(action: 'craving' | 'breathing' | 'support') {
    if (action === 'craving') pushToast('Craving logged to Trigger Log.')
    if (action === 'breathing') pushToast('Breathing exercise started.')
    if (action === 'support') pushToast('Support request queued.')
    inputRef.current?.focus()
  }

  const topSubtitle =
    activeNav === 'overview'
      ? 'Overview'
      : activeNav === 'care'
        ? 'Care Plan'
        : activeNav === 'trigger'
          ? 'Trigger Log'
          : activeNav === 'biomarkers'
            ? 'Biomarkers'
            : activeNav === 'telehealth'
              ? 'Telehealth'
              : 'Settings'

  return (
    <div className="min-h-dvh">
      {/* fixed ambient glow (viewport-anchored) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(900px 420px at 15% 0%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(740px 420px at 95% 15%, rgba(255,255,255,0.04), transparent 65%)',
        }}
      />

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-white/[0.08] bg-white/[0.02] md:block">
        <SidebarContent activeNav={activeNav} setActiveNav={setActiveNav} activeNavId={activeNavId} />
      </aside>

      {/* mobile drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute left-0 top-0 h-dvh w-[292px] border-r border-white/[0.08] bg-[#0B0F14] shadow-[0_30px_90px_-60px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-semibold text-white/85">Navigation</p>
              <button
                type="button"
                className="focusRing inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4 text-white/70" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              activeNavId={activeNavId}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="min-w-0 md:pl-[264px]">
          <div className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0B0F14]/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div>
                <p className="text-sm font-medium text-white/70">Welcome back, Alex</p>
                <p className="muted text-xs">{topSubtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="focusRing inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] md:hidden"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4 text-white/70" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="focusRing inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 text-white/70" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="focusRing inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06]"
                  aria-label="Profile"
                >
                  <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/[0.08]">
                    <span className="text-xs font-semibold text-white/80">AC</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6">
            <div key={activeNav} className="panelIn">
              {activeNav === 'overview' ? (
                <OverviewView
                  copilotLabelId={copilotLabelId}
                  copilotDraft={copilotDraft}
                  setCopilotDraft={setCopilotDraft}
                  inputRef={inputRef}
                  cravingSeries={cravingSeries}
                  heatmap={heatmap}
                  pushToast={pushToast}
                  runQuickAction={runQuickAction}
                />
              ) : activeNav === 'care' ? (
                <CarePlanView />
              ) : activeNav === 'trigger' ? (
                <TriggerLogView />
              ) : activeNav === 'biomarkers' ? (
                <BiomarkersView />
              ) : activeNav === 'telehealth' ? (
                <TelehealthView />
              ) : (
                <SettingsView />
              )}
            </div>

            <div className="mt-4 min-h-[1.25rem]" role="status" aria-live="polite">
              {toast ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
                  {toast}
                </div>
              ) : null}
            </div>
          </main>
        </div>
    </div>
  )
}
