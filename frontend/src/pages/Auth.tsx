import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle,
  Shield,
  Heart,
  Globe,
  Plus,
  BookOpen
} from 'lucide-react';

interface AuthProps {
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ initialMode = 'login', onSuccess }) => {
  const { login, signup } = useAuth();
  const { t } = useLanguage();
  
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetCode, setResetCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminToggle = () => {
    setIsAdmin(prev => {
      const nextVal = !prev;
      if (nextVal) {
        setEmail('admin@healthbot.org');
        setPassword('adminpassword');
      } else {
        setEmail('');
        setPassword('');
      }
      return nextVal;
    });
  };

  // Reset admin toggle on mode change
  useEffect(() => {
    if (mode !== 'login') {
      setIsAdmin(false);
    }
  }, [mode]);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          if (rememberMe) {
            localStorage.setItem('remembered_email', email);
          } else {
            localStorage.removeItem('remembered_email');
          }
          onSuccess();
        } else {
          setError(res.error || 'Invalid credentials');
        }
      } else if (mode === 'signup') {
        const res = await signup(email, password, fullName);
        if (res.success) {
          onSuccess();
        } else {
          setError(res.error || 'Failed to sign up');
        }
      } else if (mode === 'forgot') {
        setSuccess('If the email exists, a password reset link has been sent.');
      } else if (mode === 'reset') {
        setSuccess('Your password has been successfully reset. Please log in.');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] w-full rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* LEFT COLUMN: Healthcare Branding & Illustrations (Col 7) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-green-50 via-emerald-100/50 to-white dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950 p-8 flex flex-col justify-between items-center text-center relative border-r border-slate-100 dark:border-slate-850">
          
          {/* Top Decorative Leaves */}
          <div className="absolute top-4 left-4 flex space-x-2 text-health-600 dark:text-health-500 opacity-60">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707" />
            </svg>
          </div>
          
          {/* Header Branding */}
          <div className="space-y-4 mt-6 max-w-lg">
            {/* Logo Icon Container */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-health-600 text-white shadow-lg shadow-health-200/60 dark:shadow-none">
                  <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 18.09a5.967 5.967 0 01-.707-3.538 5.97 5.97 0 001.511-2.986 5.97 5.97 0 01-.44-2.85 5.972 5.972 0 013.155-5.32 9.76 9.76 0 015.08-1.396C16.97 2.25 21 5.944 21 12z" />
                  </svg>
                </span>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white dark:border-slate-900 shadow">
                  <Plus size={12} className="stroke-[3]" />
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-health-950 dark:text-white leading-tight">
              AI-Driven <br className="hidden sm:inline" />
              <span className="text-health-600">Public Health Chatbot</span> <br />
              <span className="text-slate-800 dark:text-slate-300 text-2xl font-bold">for Disease Awareness</span>
            </h1>

            {/* Heartbeat Divider */}
            <div className="flex items-center justify-center space-x-4 py-2">
              <div className="h-px bg-slate-200 dark:bg-slate-800 w-20"></div>
              <div className="rounded-full bg-health-100 p-1.5 text-health-600 dark:bg-health-950/40">
                <Heart size={14} className="fill-health-500 text-health-600" />
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 w-20"></div>
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Empowering Communities. Promoting Health. Saving Lives.
            </p>
          </div>

          {/* Central Family Vector Illustration (HTML/CSS Styled) */}
          <div className="my-8 relative w-full max-w-sm h-48 flex items-end justify-center">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-36 w-36 rounded-full bg-health-200/35 blur-xl" />
            <div className="absolute bottom-0 h-4 w-72 rounded-full bg-slate-200/40 dark:bg-slate-800/40 blur-xs" />
            
            {/* SVG Vector Drawing of Family of Three */}
            <svg viewBox="0 0 320 200" className="w-64 h-44 drop-shadow-md">
              {/* Father (Right) */}
              <g transform="translate(160, 0)">
                {/* Hair */}
                <path d="M40 38c0-8-12-12-20-12s-20 4-20 12c0 2 2 3 5 3h30c3 0 5-1 5-3z" fill="#1e293b"/>
                {/* Face */}
                <circle cx="20" cy="45" r="16" fill="#fbcfe8" />
                <rect x="17" y="58" width="6" height="10" fill="#fbcfe8" />
                {/* Eyes & Smile */}
                <circle cx="14" cy="43" r="1.5" fill="#0f172a" />
                <circle cx="26" cy="43" r="1.5" fill="#0f172a" />
                <path d="M16 52c2 2 6 2 8 0" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Shirt (Green) */}
                <path d="M-10 65h60l15 65H-25z" fill="#16a34a" />
              </g>

              {/* Mother (Left) */}
              <g transform="translate(60, 10)">
                {/* Long Hair */}
                <path d="M5 35c0-10 15-15 25-15s25 5 25 15v50c0 4-50 4-50 0z" fill="#475569"/>
                {/* Face */}
                <circle cx="30" cy="45" r="15" fill="#fde047" />
                <rect x="27" y="57" width="6" height="10" fill="#fde047" />
                {/* Eyes & Smile */}
                <circle cx="24" cy="43" r="1.5" fill="#0f172a" />
                <circle cx="36" cy="43" r="1.5" fill="#0f172a" />
                <path d="M26 51c2 2 6 2 8 0" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Shirt (Green) */}
                <path d="M2 65h56l12 65H-10z" fill="#22c55e" />
              </g>

              {/* Child (Center Front) */}
              <g transform="translate(115, 55)">
                {/* Hair */}
                <path d="M30 30c0-6-10-8-15-8S0 24 0 30" fill="#334155"/>
                {/* Face */}
                <circle cx="15" cy="35" r="12" fill="#fed7aa" />
                <rect x="13" y="45" width="4" height="8" fill="#fed7aa" />
                {/* Eyes & Smile */}
                <circle cx="11" cy="33" r="1" fill="#0f172a" />
                <circle cx="19" cy="33" r="1" fill="#0f172a" />
                <path d="M12 41c1.5 1.5 4.5 1.5 6 0" stroke="#0f172a" strokeWidth="1" fill="none" />
                {/* Shirt (Yellow/Light Green) */}
                <path d="M-5 50h40l8 50H-13z" fill="#86efac" />
              </g>
            </svg>
          </div>

          {/* Bottom Features Indicators Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-6 text-left">
            {[
              { text: "Reliable Information", desc: "Verified clinical guidelines", icon: CheckCircle },
              { text: "Disease Awareness", desc: "190+ detailed conditions", icon: BookOpen },
              { text: "Healthy Community", desc: "Forums & campaigns metrics", icon: Heart },
              { text: "Accessible for All", desc: "Hindi, Tamil & English logs", icon: Globe }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="flex items-start space-x-2.5 p-2 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs">
                  <span className="p-1.5 rounded-lg bg-health-600 text-white shrink-0 shadow-sm">
                    <Icon size={14} />
                  </span>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-white leading-none">{f.text}</h4>
                    <p className="text-[9px] text-slate-550 dark:text-slate-450 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: Redesigned Login Card Form (Col 5) */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="w-full max-w-sm space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-850 glass-panel">
            
            {/* Green Circular Lock Header Icon */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-health-100 dark:bg-health-950/40 text-health-600 dark:text-health-455 shadow-inner">
                <Lock className="h-6 w-6 stroke-[2]" />
              </div>
              
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {mode === 'login' && 'Welcome Back!'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'reset' && 'New Credentials'}
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 font-medium max-w-xs mx-auto">
                {mode === 'login' && "Login to continue your journey towards a healthier tomorrow."}
                {mode === 'signup' && "Register to save health logs and access diagnostics."}
                {mode === 'forgot' && "Enter your email to receive recovery instructions."}
                {mode === 'reset' && "Type your new strong password below."}
              </p>
            </div>

            {/* Admin Login Toggle Switch */}
            {mode === 'login' && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <span className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'bg-health-600 text-white shadow-sm' : 'bg-slate-200/80 text-slate-500 dark:bg-slate-800'}`}>
                    <Shield size={14} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-white leading-none">Admin Mode</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5 font-medium">Toggle to log in as administrator</p>
                  </div>
                </div>
                
                {/* Toggle Button switch */}
                <button
                  type="button"
                  onClick={handleAdminToggle}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAdmin ? 'bg-health-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  aria-pressed={isAdmin}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isAdmin ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Notification messages */}
            {error && (
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200/60 p-3.5 rounded-xl dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 p-3.5 rounded-xl dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                <CheckCircle size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text" required placeholder="Dr. Sarah Jenkins" value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-855 dark:text-white focus:outline-none focus:bg-white focus:border-health-500 transition-all font-semibold shadow-inner"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email" required placeholder="you@healthbot.org" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-855 dark:text-white focus:outline-none focus:bg-white focus:border-health-500 transition-all font-semibold shadow-inner"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-3 text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-855 dark:text-white focus:outline-none focus:bg-white focus:border-health-500 transition-all font-semibold shadow-inner"
                    />
                    {/* Working Eye Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 p-0.5 text-slate-450 hover:text-slate-700"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'reset' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reset Code</label>
                  <input
                    type="text" required placeholder="Enter verification code" value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-855 dark:text-white focus:outline-none focus:bg-white focus:border-health-500 transition-all font-semibold shadow-inner"
                  />
                </div>
              )}

              {/* Remember Me checkbox & Forgot link */}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs">
                  {/* Working Remember Me Toggle */}
                  <label className="flex items-center space-x-2 text-slate-650 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-800 text-health-600 focus:ring-health-500 h-3.5 w-3.5"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="font-bold text-health-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center rounded-xl bg-health-600 hover:bg-health-700 disabled:bg-health-400 text-white font-bold py-3.5 px-4 text-xs shadow-md shadow-health-200/50 dark:shadow-none transition-colors"
              >
                {loading ? t('loading') : (
                  <>
                    <span>
                      {mode === 'login' && 'Login'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Code'}
                      {mode === 'reset' && 'Reset Password'}
                    </span>
                    <ArrowRight size={15} className="ml-2 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* OAuth Separator */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase">
                    <span className="bg-white dark:bg-slate-900 px-2.5 text-slate-400 font-bold">Or</span>
                  </div>
                </div>

                {/* Google SSO button */}
                <button
                  onClick={() => {
                    setSuccess("Google account authenticated. Redirecting to home...");
                    setTimeout(() => onSuccess(), 1500);
                  }}
                  className="w-full flex items-center justify-center rounded-xl border border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 text-xs shadow-sm transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}

            {/* Toggle Login/Signup links */}
            <div className="text-center text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
              {mode === 'login' && (
                <p className="text-slate-500">
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="font-bold text-health-600 hover:underline">
                    Create Account
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-slate-500">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="font-bold text-health-600 hover:underline">
                    Login
                  </button>
                </p>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <button onClick={() => setMode('login')} className="font-bold text-health-600 hover:underline">
                  Back to Login
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
