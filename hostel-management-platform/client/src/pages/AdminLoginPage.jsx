import React, { useState } from 'react';
import {
  Building2,
  Terminal,
  Mail,
  Lock,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

const AdminLoginPage = ({ onAdminLogin }) => {
  // Credentials fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Security state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Single Step: Verify Email + Corporate Password
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const authorizedEmails = ['shiva@s3elite.in', 'shiva@smartpg.com', 'admin@s3elite.in'];
    if (!email || !authorizedEmails.includes(email.toLowerCase()) || !password) {
      setError('Invalid Credentials');
      return;
    }

    setLoading(true);
    try {
      // Hit Express backend API
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || {
          name: 'Shiva (Enterprise Admin)',
          email: email,
          role: 'owner'
        };
        // Ensure token is bundled with user data for localStorage
        userData.token = data.token;
        onAdminLogin(userData);
      } else {
        const json = await response.json();
        setError(json.message || 'Invalid Credentials');
      }
    } catch (err) {
      setError('Network error. Backend is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 bg-bgLight relative overflow-hidden">
      {/* Dark Corporate Grid Aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-primary mx-auto shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-borderLight text-textMuted text-[11px] font-bold uppercase tracking-wider mb-2">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              Enterprise Management Portal • Hidden Gateway
            </div>
            <h1 className="text-2xl font-black text-textDark tracking-tight">
              S3 Elite PG ERP Security Login
            </h1>
            <p className="text-xs text-textMuted mt-1">
              Authorized PG Administration & Financial Verification Gateway
            </p>
          </div>
        </div>

        {/* Corporate Credentials Card */}
        <div className="p-8 rounded-2xl bg-white border border-borderLight shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-borderLight pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-textMuted">
              Admin Gateway Access
            </span>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textDark mb-1.5">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-textMuted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shiva@s3elite.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-borderLight rounded-xl text-xs text-textDark placeholder:text-textMuted focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textDark mb-1.5">
                Corporate Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-textMuted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-borderLight rounded-xl text-xs text-textDark placeholder:text-textMuted focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-textMuted cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-borderLight text-primary focus:ring-0"
                />
                Remember Device
              </label>
              <button
                type="button"
                onClick={() => alert('Corporate admin recovery request dispatched to authorized security log.')}
                className="text-primary hover:text-primaryHover font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-textMuted">
          S3 Elite PG ERP Security
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
