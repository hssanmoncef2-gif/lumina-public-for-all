'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const STARS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  size: (((i * 7 + 3) % 17) / 17) * 2 + 1,
  top:  (((i * 13 + 5) % 97)) + '%',
  left: (((i * 11 + 2) % 89)) + '%',
  op:   (((i * 9  + 1) % 5)  / 10) + 0.1,
}));

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email, password, redirect: false,
    });
    if (res?.ok) {
      router.push('/home');
    } else {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09091a] text-white flex items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_30%_20%,rgba(88,28,220,0.16),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_75%_85%,rgba(20,180,160,0.1),transparent)]" />
        {STARS.map(s => (
          <div key={s.id} className="absolute rounded-full bg-white"
            style={{ width: s.size, height: s.size, top: s.top, left: s.left, opacity: s.op }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] mb-4">
            <Sparkles size={22} className="text-violet-400/70" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/25 mb-1">Welcome back</p>
          <h1 className="text-2xl font-light tracking-wide text-white/90">Lumina</h1>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-white/30 uppercase tracking-widest mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-400/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/30 uppercase tracking-widest mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 outline-none focus:border-violet-400/40 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-[12px] text-red-400/80 text-center -mt-1 mb-1">{error}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl font-medium text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(45,212,191,0.25))',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#c4b5fd',
                boxShadow: '0 0 28px rgba(139,92,246,0.15)',
              }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-xs text-white/20 mt-5">
            No account?{' '}
            <Link href="/auth/signup" className="text-violet-400/60 hover:text-violet-400/90 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
