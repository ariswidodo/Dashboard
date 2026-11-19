import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle, Store } from 'lucide-react';

// Pemetaan username khusus EPR ke email autentikasi terdaftar
const USERNAME_ALIASES: Record<string, string> = {
  hetero: 'heteroniaga@epr26.id',
  rajaink: 'rajaprint@epr26.id',
  micro: 'microprinter@epr26.id',
  kodoescom: 'pribumijaya@epr26.id',
  primakom: 'primakomputer@epr26.id',
  ipk: 'infokom@epr26.id',
  sedardigital: 'mitrapratama@epr26.id',
  khm: 'karyahidupmulya@epr26.id',
  ungu: 'salamjaya@epr26.id',
  afa: 'mitrasarana@epr26.id',
};

interface Props {
  onLoginSuccess: () => void;
}

export const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const prefix = cleanUsername.split('@')[0];

    // Bangun daftar kandidat email: alias khusus, domain @epr26.id, dan domain @epp26.id
    const candidates: string[] = [];

    if (USERNAME_ALIASES[prefix]) {
      candidates.push(USERNAME_ALIASES[prefix]);
    }

    if (cleanUsername.includes('@')) {
      if (!candidates.includes(cleanUsername)) {
        candidates.push(cleanUsername);
      }
    } else {
      const eprEmail = `${cleanUsername}@epr26.id`;
      const eppEmail = `${cleanUsername}@epp26.id`;
      if (!candidates.includes(eprEmail)) candidates.push(eprEmail);
      if (!candidates.includes(eppEmail)) candidates.push(eppEmail);
    }

    try {
      let lastError: any = null;

      for (const emailToUse of candidates) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (!authError && data.user) {
          onLoginSuccess();
          return;
        }
        lastError = authError;
      }

      // Semua domain gagal
      if (lastError?.message?.includes('Invalid login credentials') ||
          lastError?.message?.includes('invalid_credentials')) {
        throw new Error('Username atau password salah. Silakan periksa kembali kredensial Anda.');
      }
      throw lastError;
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portal Partner</h1>
          <p className="text-sm text-slate-400 mt-1">
            EPR Semarang dan Sekitar nya
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          {/* Disclaimer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-amber-700 font-bold leading-relaxed">
              Disclaimer: Angka dan perhitungan di Portal ini bersifat estimasi awal dan bukan merupakan perhitungan resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
