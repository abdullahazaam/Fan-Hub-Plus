import { useState } from 'react'
import { apiForgotPassword, apiResetPassword } from '../api'
import { useAuth } from '../context/AuthContext'
import type { ForgotPasswordResponse } from '../types'

type Tab = 'login' | 'register' | 'forgot' | 'reset'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regDisplayName, setRegDisplayName] = useState('')

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotResult, setForgotResult] = useState<ForgotPasswordResponse | null>(null)

  // Reset password
  const [resetToken, setResetToken] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  if (!isOpen) return null

  const clearErrors = () => setError('')

  // ── Login ─────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginEmail.trim(), loginPassword)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const isDev = import.meta.env.DEV

  function fillDemoAdmin() {
    setLoginEmail('admin@fanhubplus.local')
    clearErrors()
  }

  function fillDemoMember() {
    setLoginEmail('user@fanhubplus.local')
    clearErrors()
  }

  // ── Register ──────────────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        displayName: regDisplayName.trim(),
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password ───────────────────────────────────────────────────────
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await apiForgotPassword({ email: forgotEmail.trim() })
      setForgotResult(result)
      // Auto-populate reset token field if dev token provided
      if (result.devResetToken) {
        setResetToken(result.devResetToken)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Reset Password ────────────────────────────────────────────────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiResetPassword({ token: resetToken.trim(), newPassword: resetPassword })
      setResetSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Authentication">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        <div className="auth-logo">⬡ Fan Hub Plus</div>

        {/* Tab bar */}
        <div className="auth-tabs" role="tablist">
          {(['login', 'register', 'forgot', 'reset'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`auth-tab ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); clearErrors() }}
            >
              {t === 'login' ? 'Sign In' : t === 'register' ? 'Register' : t === 'forgot' ? 'Forgot' : 'Reset'}
            </button>
          ))}
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        {/* ── Login Tab ─────────────────────────────────────────────────── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            {isDev && (
              <div className="auth-demo-row">
                <span className="auth-demo-label">Dev quick-fill:</span>
                <button type="button" className="btn-demo admin" onClick={fillDemoAdmin}>Admin Email</button>
                <button type="button" className="btn-demo member" onClick={fillDemoMember}>Member Email</button>
              </div>
            )}
            <label className="auth-field-label">Email</label>
            <input
              className="auth-input" type="email" required
              value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <label className="auth-field-label">Password</label>
            <input
              className="auth-input" type="password" required
              value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Register Tab ──────────────────────────────────────────────── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <label className="auth-field-label">Username</label>
            <input
              className="auth-input" type="text" required
              value={regUsername} onChange={(e) => setRegUsername(e.target.value)}
              placeholder="fandom_fan"
            />
            <label className="auth-field-label">Display Name</label>
            <input
              className="auth-input" type="text"
              value={regDisplayName} onChange={(e) => setRegDisplayName(e.target.value)}
              placeholder="Fandom Fan"
            />
            <label className="auth-field-label">Email</label>
            <input
              className="auth-input" type="email" required
              value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <label className="auth-field-label">Password <span className="hint">(min 8 characters)</span></label>
            <input
              className="auth-input" type="password" required minLength={8}
              value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* ── Forgot Password Tab ───────────────────────────────────────── */}
        {tab === 'forgot' && (
          <div className="auth-form">
            {!forgotResult ? (
              <form onSubmit={handleForgot}>
                <p className="auth-info-text">Enter your account email to receive a password reset token.</p>
                <label className="auth-field-label">Email</label>
                <input
                  className="auth-input" type="email" required
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <button className="btn-auth-submit" type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Request Reset Token'}
                </button>
              </form>
            ) : (
              <div className="forgot-result">
                <p className="auth-success-text">{forgotResult.message}</p>
                {forgotResult.devResetToken && (
                  <div className="dev-token-box">
                    <div className="dev-token-badge">🛠 Development Only</div>
                    <p className="dev-token-notice">{forgotResult.devNotice}</p>
                    <code className="dev-token-value">{forgotResult.devResetToken}</code>
                    <button
                      className="btn-copy-token"
                      onClick={() => {
                        navigator.clipboard.writeText(forgotResult.devResetToken ?? '')
                        setResetToken(forgotResult.devResetToken ?? '')
                        setTab('reset')
                      }}
                    >
                      Copy Token &amp; Go to Reset →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Reset Password Tab ────────────────────────────────────────── */}
        {tab === 'reset' && (
          <div className="auth-form">
            {resetSuccess ? (
              <div className="auth-success-text">
                <p>✓ Password reset successfully. You may now sign in.</p>
                <button className="btn-auth-submit" onClick={() => { setTab('login'); setResetSuccess(false) }}>
                  Go to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset}>
                <label className="auth-field-label">Reset Token</label>
                <input
                  className="auth-input" type="text" required
                  value={resetToken} onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token here"
                />
                <label className="auth-field-label">New Password <span className="hint">(min 8 characters)</span></label>
                <input
                  className="auth-input" type="password" required minLength={8}
                  value={resetPassword} onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button className="btn-auth-submit" type="submit" disabled={loading}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
