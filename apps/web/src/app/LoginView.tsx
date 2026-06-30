import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { Sparkles, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import api from '../lib/api';

export default function LoginView() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '' });
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: async (res: any) => {
          if (!res?.credential) return;
          try {
            setLoading(true);
            setError('');
            const { data } = await api.post('/auth/google', { token: res.credential });
            if (data.accessToken) {
              localStorage.setItem('zenith_token', data.accessToken);
              localStorage.setItem('zenith_user', JSON.stringify(data.user));
              window.location.reload();
            }
          } catch (err: any) {
            setError(err.response?.data?.message || 'Google sign-in failed');
          } finally {
            setLoading(false);
          }
        },
      });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(form);
      } else if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { email: form.email });
        setForgotSent(true);
      } else {
        await login(form.email, form.password);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dark min-h-screen bg-[#07071A] font-body" style={{ minHeight: '100vh', background: '#07071A' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div className="aurora1 absolute -top-48 -left-48 w-[760px] h-[760px] rounded-full opacity-[.28]"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 68%)' }} />
        <div className="aurora2 absolute -top-24 right-0 w-[640px] h-[640px] rounded-full opacity-[.22]"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 68%)' }} />
        <div className="aurora3 absolute bottom-0 left-1/3 w-[860px] h-[620px] rounded-full opacity-[.18]"
          style={{ background: 'radial-gradient(circle, #0891B2 0%, transparent 68%)' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6" style={{ minHeight: '100vh' }}>
        <div className="w-full max-w-md fade-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white mx-auto mb-4 font-display"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', fontFamily: "'Clash Display','Exo 2',sans-serif" }}>
              Z
            </div>
            <h1 className="text-3xl font-black text-white mb-1 font-display" style={{ fontFamily: "'Clash Display','Exo 2',sans-serif" }}>
              <span style={{
                background: 'linear-gradient(135deg, #A78BFA, #60A5FA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Zenith</span>
            </h1>
            <p className="text-white/40 text-sm">Create. Compete. Go Viral.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white/[.06] border border-white/[.08] rounded-2xl p-1"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16 }}>
              <div className="flex items-center gap-3 px-4 py-3">
                <Mail size={16} className="text-white/35 flex-shrink-0" />
                <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30" />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-4">
                <div className="bg-white/[.06] border border-white/[.08] rounded-2xl p-1"
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16 }}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-white/35 text-base flex-shrink-0">@</span>
                    <input type="text" placeholder="Username" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                      className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30" />
                  </div>
                </div>
                <div className="bg-white/[.06] border border-white/[.08] rounded-2xl p-1"
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16 }}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-white/35 flex-shrink-0">👤</span>
                    <input type="text" placeholder="Display Name" required value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })}
                      className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30" />
                  </div>
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="bg-white/[.06] border border-white/[.08] rounded-2xl p-1"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16 }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Lock size={16} className="text-white/35 flex-shrink-0" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0">
                    {showPassword ? <EyeOff size={16} className="text-white/35" /> : <Eye size={16} className="text-white/35" />}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {forgotSent && <p className="text-green-400 text-sm text-center">If that email exists, a reset link has been sent.</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[.98] disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                boxShadow: '0 0 28px rgba(139,92,246,.4), 0 8px 32px rgba(139,92,246,.2)',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
                  Loading...
                </span>
              ) : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-white/30 bg-[#07071A]">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const win = window as any;
              if (win.google?.accounts) {
                if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                  win.google.accounts.id.renderButton(
                    document.createElement('div'),
                    { theme: 'outline', size: 'large', width: 320 }
                  );
                  win.google.accounts.id.prompt();
                } else {
                  setError('Google sign-in not configured (missing VITE_GOOGLE_CLIENT_ID)');
                }
              } else {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                  const g = (window as any).google.accounts;
                  if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                    g.id.initialize({
                      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                      callback: async (res: any) => {
                        if (!res?.credential) return;
                        try {
                          setLoading(true);
                          setError('');
                          const { data } = await api.post('/auth/google', { token: res.credential });
                          if (data.accessToken) {
                            localStorage.setItem('zenith_token', data.accessToken);
                            localStorage.setItem('zenith_user', JSON.stringify(data.user));
                            window.location.reload();
                          }
                        } catch (err: any) {
                          setError(err.response?.data?.message || 'Google sign-in failed');
                        } finally {
                          setLoading(false);
                        }
                      },
                    });
                    g.id.prompt();
                  } else {
                    setError('Google sign-in not configured (missing VITE_GOOGLE_CLIENT_ID)');
                  }
                };
                document.head.appendChild(script);
              }
            }}
            className="w-full py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[.98] bg-white/[.06] border border-white/[.10]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>

          <div className="mt-6 text-center space-y-3">
            {mode === 'forgot' ? (
              <button onClick={() => { setMode('login'); setError(''); setForgotSent(false); }}
                className="text-sm" style={{ color: '#A78BFA' }}>
                Back to sign in <ArrowRight size={12} className="inline" />
              </button>
            ) : (
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-sm" style={{ color: '#A78BFA' }}>
                {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'} <ArrowRight size={12} className="inline" />
              </button>
            )}
          </div>

          <div className="mt-5 text-center space-y-3">
            {mode === 'login' && (
              <button onClick={() => { setMode('forgot'); setError(''); }}
                className="text-xs text-white/35 hover:text-white/60 transition-colors">
                Forgot password?
              </button>
            )}
            <div className="flex items-center gap-2 justify-center">
              <Sparkles size={12} style={{ color: '#A78BFA' }} />
              <span className="text-white/30 text-xs">Demo accounts: admin@zenith.com / password123</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes aurora1 { 0%,100%{transform:translate(0,0) scale(1)} 25%{transform:translate(4%,8%) scale(1.12)} 50%{transform:translate(-3%,12%) scale(0.93)} 75%{transform:translate(7%,-4%) scale(1.08)} }
        @keyframes aurora2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-7%,6%) scale(1.18)} 66%{transform:translate(6%,-7%) scale(0.9)} }
        @keyframes aurora3 { 0%,100%{transform:translate(0,0) scale(1.08)} 50%{transform:translate(9%,5%) scale(0.92)} }
        .aurora1{animation:aurora1 16s ease-in-out infinite}
        .aurora2{animation:aurora2 20s ease-in-out infinite}
        .aurora3{animation:aurora3 13s ease-in-out infinite}
      `}</style>
    </div>
  );
}
