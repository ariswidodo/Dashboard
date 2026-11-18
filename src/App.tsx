import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EppDashboard } from './components/EppDashboard';
import { Loader2, AlertTriangle } from 'lucide-react';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'epp' | 'epr' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        determineUserRole(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        determineUserRole(session.user);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const determineUserRole = async (user: any) => {
    const email = user.email?.toLowerCase() || '';
    const username = email.split('@')[0];

    // 1. Cek Admin
    if (email === 'admin@epr26.id' || user.user_metadata?.role === 'admin') {
      setUserRole('admin');
      setLoading(false);
      return;
    }

    // 2. Cek apakah pengguna adalah EPP
    try {
      const { data: epp } = await supabase
        .from('epp_stores')
        .select('id')
        .or(`user_id.eq.${user.id},username.eq.${username}`)
        .maybeSingle();

      if (epp) {
        setUserRole('epp');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error('Error checking epp role:', e);
    }

    // 3. Default adalah toko retail (EPR)
    setUserRole('epr');
    setLoading(false);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-slate-100">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Konfigurasi Supabase Diperlukan</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Aplikasi belum terhubung ke akun Supabase Anda. Silakan periksa file <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-blue-600">.env</code> Anda.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-sm font-medium">Memverifikasi profil & peran pengguna...</span>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

  // Routing berdasarkan peran pengguna
  if (userRole === 'admin') {
    return (
      <AdminDashboard 
        userEmail={session.user.email} 
        onLogout={() => supabase.auth.signOut()} 
      />
    );
  }

  if (userRole === 'epp') {
    return (
      <EppDashboard 
        userEmail={session.user.email} 
        onLogout={() => supabase.auth.signOut()} 
      />
    );
  }

  return (
    <Dashboard 
      userEmail={session.user.email} 
      onLogout={() => supabase.auth.signOut()} 
    />
  );
}

export default App;
