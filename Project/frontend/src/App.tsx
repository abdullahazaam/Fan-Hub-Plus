import { useEffect, useState } from 'react'
import './App.css'

interface HealthResponse {
  status: string
  service: string
  timestamp: string
  version: string
}

function App() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      // Primary proxy fetch with direct backend fallback
      let res: Response
      try {
        res = await fetch('/api/health')
      } catch {
        res = await fetch('http://localhost:5075/api/health')
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const data: HealthResponse = await res.json()
      setHealthData(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to reach backend API')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="app-container">
      <div className="portal-glow" aria-hidden="true" />
      <header className="header">
        <div className="brand-badge">NN-Zynex • Fandom Universe</div>
        <h1 className="title">Fan Hub Plus</h1>
        <p className="subtitle">
          Next-Generation Interactive Fandom & Community Portal
        </p>
      </header>

      <main className="main-content">
        <div className="card">
          <div className="card-header">
            <span className="card-tag">Backend Service Integration</span>
            <div className={`status-indicator ${loading ? 'loading' : healthData ? 'online' : 'error'}`}>
              <span className="dot" />
              <span>{loading ? 'Checking...' : healthData ? 'API Connected' : 'Offline'}</span>
            </div>
          </div>

          <div className="endpoint-info">
            <span className="method">GET</span>
            <code>/api/health</code>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Connecting to ASP.NET Core Web API...</p>
            </div>
          )}

          {error && (
            <div className="error-box">
              <p className="error-title">Connection Alert</p>
              <p className="error-desc">{error}</p>
              <p className="error-hint">Ensure backend is running on <code>http://localhost:5075</code></p>
            </div>
          )}

          {healthData && (
            <div className="response-box">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Status</span>
                  <span className="val highlight">{healthData.status}</span>
                </div>
                <div className="info-item">
                  <span className="label">Service</span>
                  <span className="val">{healthData.service}</span>
                </div>
                <div className="info-item">
                  <span className="label">Version</span>
                  <span className="val">{healthData.version}</span>
                </div>
                <div className="info-item">
                  <span className="label">UTC Time</span>
                  <span className="val time">{new Date(healthData.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="raw-json">
                <div className="raw-header">Payload Response</div>
                <pre>{JSON.stringify(healthData, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="card-footer">
            <button className="refresh-btn" onClick={checkHealth} disabled={loading}>
              {loading ? 'Pinging...' : 'Ping API Health'}
            </button>
            <span className="target-url">Target: http://localhost:5075/api/health</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
