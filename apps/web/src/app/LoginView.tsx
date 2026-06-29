import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Sparkles, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginView() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
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

            {isRegister && (
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

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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
              ) : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm" style={{ color: '#A78BFA' }}>
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"} <ArrowRight size={12} className="inline" />
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
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
