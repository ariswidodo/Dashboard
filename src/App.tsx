import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Loader2, AlertTriangle, Key } from 'lucide-react';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-slate-100">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Konfigurasi Supabase Diperlukan</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Aplikasi belum terhubung ke akun Supabase Anda. Silakan buat file <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-blue-600">.env</code> di dalam folder proyek ini dengan kredensial dari dashboard Supabase Anda.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-left font-mono text-xs text-slate-700 space-y-1 mb-6 border border-slate-200">
            <div>VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=eyJhbg...</div>
          </div>
          <p className="text-xs text-slate-400">
            Setelah mengisi file .env, simpan dan reload halaman ini.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-sm font-medium">Menyiapkan Portal EPR FY26...</span>
      </div>
    );
  }

  return session ? (
    <Dashboard 
      userEmail={session.user.email} 
      onLogout={() => supabase.auth.signOut()} 
    />
  ) : (
    <Login onLoginSuccess={() => {}} />
  );
}

export default App;
