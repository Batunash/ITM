import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#475569', '#22c55e'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { fullName, email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={s.brandName}>ITSM Portal</span>
        </div>
        <div style={s.heroText}>
          <h2 style={s.heroTitle}>Join your IT team today.</h2>
          <p style={s.heroSub}>Create an account to start submitting tickets, tracking assets, and staying on top of every service request.</p>
        </div>
        <div style={s.steps}>
          {[
            ['1', 'Create your account', 'Fill in your name, email, and password'],
            ['2', 'Sign in instantly', 'You will be logged in automatically after registration'],
            ['3', 'Start working', 'Submit tickets and track IT assets right away'],
          ].map(([num, title, desc]) => (
            <div key={num} style={s.step}>
              <div style={s.stepNum}>{num}</div>
              <div>
                <div style={s.stepTitle}>{title}</div>
                <div style={s.stepDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h1 style={s.cardTitle}>Create an account</h1>
          <p style={s.cardSub}>Fill in the details below to get started</p>

          {error && (
            <div style={s.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Full name</label>
              <div style={s.inputWrap}>
                <svg style={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  style={s.input}
                  type="text"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <div style={s.inputWrap}>
                <svg style={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  style={s.input}
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <svg style={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  style={s.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {password && (
                <div style={s.strengthRow}>
                  <div style={s.strengthBars}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ ...s.strengthBar, background: i <= strength ? strengthColor : '#e2e8f0' }} />
                    ))}
                  </div>
                  <span style={{ ...s.strengthLabel, color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div style={s.field}>
              <label style={s.label}>Confirm password</label>
              <div style={s.inputWrap}>
                <svg style={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  style={{ ...s.input, borderColor: confirm && confirm !== password ? '#fca5a5' : undefined }}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                  {showConfirm
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {confirm && confirm !== password && (
                <span style={s.matchError}>Passwords do not match</span>
              )}
            </div>

            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading
                ? <><span style={s.spinner} />Creating account...</>
                : 'Create account'}
            </button>
          </form>

          <p style={s.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={s.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" },
  left: { flex: '0 0 440px', background: '#1e293b', padding: '48px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, background: 'transparent', border: '1px solid #334155', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'none' },
  brandName: { color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' },
  heroText: { margin: '60px 0 40px' },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.5px' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6, margin: 0 },
  steps: { display: 'flex', flexDirection: 'column', gap: 24 },
  step: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepTitle: { color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 2 },
  stepDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  right: { flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' },
  card: { background: '#fff', borderRadius: 4, padding: '40px 40px', width: '100%', maxWidth: 420, border: '1px solid #e2e8f0', boxShadow: 'none' },
  cardTitle: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.4px' },
  cardSub: { color: '#64748b', fontSize: 14, margin: '0 0 28px' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 4, fontSize: 13, marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 12, pointerEvents: 'none' },
  input: { width: '100%', padding: '11px 40px 11px 38px', border: '1.5px solid #e2e8f0', borderRadius: 4, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff', transition: 'border-color 0.15s' },
  eyeBtn: { position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  strengthRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 },
  strengthBars: { display: 'flex', gap: 4, flex: 1 },
  strengthBar: { height: 4, flex: 1, borderRadius: 2, transition: 'background 0.2s' },
  strengthLabel: { fontSize: 12, fontWeight: 600, minWidth: 36 },
  matchError: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#059669', color: '#fff', border: 'none', padding: '12px', borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'background 0.15s' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
  switchText: { textAlign: 'center', margin: '20px 0 0', fontSize: 14, color: '#64748b' },
  switchLink: { color: '#334155', fontWeight: 600, textDecoration: 'none' },
};
