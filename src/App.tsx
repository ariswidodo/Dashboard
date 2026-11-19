import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Login } from './components/Login';
import { ModernEprDashboard } from './components/ModernEprDashboard';
import { Loader2, AlertTriangle } from 'lucide-react';

const SESSION_TAB_KEY = 'epr_session_tab_active';
const SESSION_ACTIVITY_KEY = 'epr_session_last_activity';
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 60 * 1000;

export function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'epp' | 'epr' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadSession = async () => {
      // sessionStorage bertahan saat refresh, tetapi dihapus saat tab/browser
      // ditutup. Dengan begitu, sesi Supabase lama tidak dipulihkan setelah
      // browser dibuka kembali.
      const isSameOpenTab = sessionStorage.getItem(SESSION_TAB_KEY) === '1';
      if (!isSameOpenTab) {
        sessionStorage.setItem(SESSION_TAB_KEY, '1');
        sessionStorage.removeItem(SESSION_ACTIVITY_KEY);
        await supabase.auth.signOut({ scope: 'local' });
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(currentSession);
      if (currentSession) {
        determineUserRole(currentSession.user);
      } else {
        setLoading(false);
      }
    };

    loadSession().catch((error) => {
      console.error('Gagal memuat sesi:', error);
      if (!cancelled) setLoading(false);
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

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Logout otomatis setelah 5 jam tanpa aktivitas di dashboard.
  useEffect(() => {
    if (!session) return undefined;

    let logoutStarted = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastRecordedActivity = Number(sessionStorage.getItem(SESSION_ACTIVITY_KEY)) || Date.now();

    const logoutSession = async () => {
      if (logoutStarted) return;
      logoutStarted = true;
      sessionStorage.removeItem(SESSION_ACTIVITY_KEY);
      sessionStorage.removeItem(SESSION_TAB_KEY);
      await supabase.auth.signOut({ scope: 'local' });
    };

    const scheduleLogout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      const remaining = INACTIVITY_TIMEOUT_MS - (Date.now() - lastRecordedActivity);
      if (remaining <= 0) {
        void logoutSession();
        return;
      }
      timeoutId = setTimeout(() => void logoutSession(), remaining);
    };

    // Aktivitas pertama setelah login memulai hitungan 5 jam.
    if (!sessionStorage.getItem(SESSION_ACTIVITY_KEY)) {
      lastRecordedActivity = Date.now();
      sessionStorage.setItem(SESSION_ACTIVITY_KEY, String(lastRecordedActivity));
    }

    let lastEventHandledAt = 0;
    const handleActivity = () => {
      const now = Date.now();
      // Mouse bergerak sangat sering; cukup simpan aktivitas maksimal sekali
      // per detik agar tidak membebani storage dan timer.
      if (now - lastEventHandledAt < 1000) return;
      lastEventHandledAt = now;
      lastRecordedActivity = now;
      sessionStorage.setItem(SESSION_ACTIVITY_KEY, String(now));
      scheduleLogout();
    };
    const eventOptions: AddEventListenerOptions = { passive: true };
    const activityEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'touchstart',
      'scroll',
      'mousemove',
    ];

    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleActivity, eventOptions));
    scheduleLogout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleActivity, eventOptions));
    };
  }, [Boolean(session)]);

  const handleLogout = async () => {
    sessionStorage.removeItem(SESSION_ACTIVITY_KEY);
    sessionStorage.removeItem(SESSION_TAB_KEY);
    await supabase.auth.signOut({ scope: 'local' });
  };

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

    // 3. Default adalah EPR
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

  // Tampilkan Modern Power BI Dashboard yang adaptif terhadap peran pengguna (Admin / EPP / EPR)
  // Ambil epr_code dari user_metadata (diisi saat akun dibuat via SQL)
  const userEprCode: string = session.user.user_metadata?.epr_code || '';

  return (
    <ModernEprDashboard 
      userEmail={session.user.email} 
      userRole={userRole || 'epr'}
      userEprCode={userEprCode}
      onLogout={handleLogout}
    />
  );
}

export default App;
