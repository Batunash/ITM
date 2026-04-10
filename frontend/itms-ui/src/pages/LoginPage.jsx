import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
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
          <h2 style={s.heroTitle}>Manage. Track. Resolve.</h2>
          <p style={s.heroSub}>Your unified platform for IT service management, asset tracking, and support operations.</p>
        </div>
        <div style={s.features}>
          {[
            ['Ticket Management', 'Create and track IT support requests'],
            ['Asset Tracking', 'Monitor hardware inventory in real time'],
            ['SLA Compliance', 'Ensure service targets are always met'],
          ].map(([title, desc]) => (
            <div key={title} style={s.featureItem}>
              <div style={s.featureDot} />
              <div>
                <div style={s.featureTitle}>{title}</div>
                <div style={s.featureDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h1 style={s.cardTitle}>Welcome back</h1>
          <p style={s.cardSub}>Sign in to your account to continue</p>

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
                  autoFocus
                />
              </div>
            </div>

            <div style={s.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={s.label}>Password</label>
                <a href="#" style={s.forgotLink}>Forgot password?</a>
              </div>
              <div style={s.inputWrap}>
                <svg style={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  style={s.input}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
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
            </div>

            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading
                ? <><span style={s.spinner} />Signing in...</>
                : 'Sign in'}
            </button>
          </form>

          <p style={s.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={s.switchLink}>Create one</Link>
          </p>

          <div style={s.divider}><span style={s.dividerText}>Demo accounts</span></div>
          <div style={s.demoGrid}>
            {[
              { role: 'Admin', email: 'admin@itms.com' },
              { role: 'Manager', email: 'manager@itms.com' },
              { role: 'Agent', email: 'agent@itms.com' },
              { role: 'End User', email: 'enduser@itms.com' },
            ].map(d => (
              <button key={d.role} style={s.demoBtn} type="button"
                onClick={() => { setEmail(d.email); setPassword('Password123!'); }}>
                <span style={s.demoRole}>{d.role}</span>
                <span style={s.demoEmail}>{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" },
  left: { flex: '0 0 440px', background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)', padding: '48px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' },
  brandName: { color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' },
  heroText: { margin: '60px 0 40px' },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.5px' },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.6, margin: 0 },
  features: { display: 'flex', flexDirection: 'column', gap: 20 },
  featureItem: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  featureDot: { width: 8, height: 8, borderRadius: '50%', background: '#93c5fd', marginTop: 6, flexShrink: 0 },
  featureTitle: { color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 2 },
  featureDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  right: { flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' },
  card: { background: '#fff', borderRadius: 20, padding: '40px 40px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.4px' },
  cardSub: { color: '#64748b', fontSize: 14, margin: '0 0 28px' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 12, pointerEvents: 'none' },
  input: { width: '100%', padding: '11px 40px 11px 38px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff', transition: 'border-color 0.15s' },
  eyeBtn: { position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  forgotLink: { fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'background 0.15s' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
  switchText: { textAlign: 'center', margin: '20px 0 0', fontSize: 14, color: '#64748b' },
  switchLink: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' },
  divider: { position: 'relative', textAlign: 'center', margin: '24px 0 16px', borderTop: '1px solid #f1f5f9' },
  dividerText: { position: 'relative', top: -10, background: '#fff', padding: '0 12px', color: '#94a3b8', fontSize: 12, fontWeight: 500 },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  demoBtn: { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, background 0.15s' },
  demoRole: { display: 'block', fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 2 },
  demoEmail: { display: 'block', fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};
