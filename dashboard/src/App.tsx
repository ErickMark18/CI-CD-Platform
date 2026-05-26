import { useState, useEffect } from 'react'
import './App.css'

interface Deploy {
  id: string
  sha: string
  branch: string
  date: string
  duration: number
  status: 'success' | 'rollback' | 'failed'
  version: string
}

const MOCK_DEPLOYS: Deploy[] = [
  { id: '1', sha: 'a1b2c3d', branch: 'main', date: '2026-05-26T10:30:00Z', duration: 142, status: 'success', version: 'v1.0.4' },
  { id: '2', sha: 'e5f6g7h', branch: 'main', date: '2026-05-25T14:22:00Z', duration: 158, status: 'success', version: 'v1.0.3' },
  { id: '3', sha: 'i8j9k0l', branch: 'main', date: '2026-05-24T09:15:00Z', duration: 201, status: 'rollback', version: 'v1.0.2' },
  { id: '4', sha: 'm1n2o3p', branch: 'feature/dashboard', date: '2026-05-23T16:45:00Z', duration: 89, status: 'success', version: 'sha-abc1234' },
  { id: '5', sha: 'q4r5s6t', branch: 'main', date: '2026-05-22T11:00:00Z', duration: 134, status: 'success', version: 'v1.0.1' },
]

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function DeployRow({ deploy, index }: { deploy: Deploy; index: number }) {
  const statusColor = deploy.status === 'success' ? 'var(--accent-green)' : deploy.status === 'rollback' ? 'var(--accent-amber)' : 'var(--accent-red)'
  const statusText = deploy.status === 'success' ? 'SUCCESS' : deploy.status === 'rollback' ? 'ROLLBACK' : 'FAILED'

  return (
    <div className="deploy-row" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="deploy-sha">{deploy.sha}</div>
      <div className="deploy-branch">{deploy.branch}</div>
      <div className="deploy-date">{new Date(deploy.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
      <div className="deploy-duration">{deploy.duration}s</div>
      <div className="deploy-status" style={{ color: statusColor }}>
        <span className="status-dot" />
        {statusText}
      </div>
      <div className="deploy-version">{deploy.version}</div>
    </div>
  )
}

function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((v - min) / range) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="trend-chart">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent-green)"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#chartGrad)"
        />
      </svg>
    </div>
  )
}

export default function App() {
  const [deploys] = useState<Deploy[]>(MOCK_DEPLOYS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const avgDuration = Math.ceil(deploys.reduce((a, b) => a + b.duration, 0) / deploys.length)
  const successRate = Math.round((deploys.filter(d => d.status === 'success').length / deploys.length) * 100)
  const trendData = deploys.slice(-5).map(d => d.duration)

  return (
    <div className={`app ${loaded ? 'loaded' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="4" fill="#0a0a0a"/>
              <circle cx="16" cy="16" r="6" fill="none" stroke="#00ff88" strokeWidth="2"/>
              <circle cx="16" cy="16" r="2" fill="#00ff88"/>
            </svg>
            <span>CI/CD Monitor</span>
          </div>
          <div className="header-badge">
            <span className="pulse" />
            LIVE
          </div>
        </div>
      </header>

      <main className="main">
        <section className="stats-grid">
          <StatCard
            label="Total Deploys"
            value={deploys.length.toString()}
          />
          <StatCard
            label="Avg Duration"
            value={`${avgDuration}s`}
            sub="last 5 deploys"
          />
          <StatCard
            label="Success Rate"
            value={`${successRate}%`}
            sub="last 30 days"
          />
          <StatCard
            label="Rollbacks"
            value={deploys.filter(d => d.status === 'rollback').length.toString()}
          />
        </section>

        <section className="trend-section">
          <div className="section-header">
            <h2>Pipeline Duration Trend</h2>
            <span className="trend-sub">seconds · last 5 deploys</span>
          </div>
          <TrendChart data={trendData} />
        </section>

        <section className="deploys-section">
          <div className="section-header">
            <h2>Deployment History</h2>
            <span className="trend-sub">github actions</span>
          </div>
          <div className="deploys-table">
            <div className="table-header">
              <div>Commit</div>
              <div>Branch</div>
              <div>Date</div>
              <div>Duration</div>
              <div>Status</div>
              <div>Version</div>
            </div>
            {deploys.map((d, i) => (
              <DeployRow key={d.id} deploy={d} index={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
