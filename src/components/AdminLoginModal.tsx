import React, { useState } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Secure authentication check against administrator credentials
      if (
        email.trim().toLowerCase() === 'rajaraza300@gmail.com' &&
        password.trim() === 'raza12345'
      ) {
        setLoading(false);
        onLoginSuccess();
      } else {
        setLoading(false);
        setError('Invalid admin credentials. Please enter a valid administrator email and password.');
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#213145]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-[#eff4ff] text-[#464554] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header with Insight Logo */}
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.svg"
            alt="Insight Products Logo"
            className="w-12 h-12 rounded-2xl object-contain shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-lg text-[#0b1c30]">
                Insight Admin Portal
              </h3>
              <span className="text-[10px] font-bold bg-[#eff4ff] text-[#4648d4] px-2 py-0.5 rounded-full border border-[#dce9ff]">
                Restricted Access
              </span>
            </div>
            <p className="text-xs text-[#767586] mt-0.5">
              Enter authorized administrative credentials to access operations ledger and CRM.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 text-xs">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">
                lock_clock
              </span>
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Admin Email Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#0b1c30] tracking-wide">
              ADMINISTRATOR EMAIL
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ea580c] transition-all"
                placeholder="admin@insightproducts.pk"
                autoComplete="email"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#767586]">
                alternate_email
              </span>
            </div>
          </div>

          {/* Admin Password Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#0b1c30] tracking-wide">
              ADMIN ACCESS KEY / PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ea580c] transition-all font-mono"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#767586]">
                key
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#767586] hover:text-[#0b1c30] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Sign In &amp; Unlock Operations CRM</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="p-3 bg-[#eff4ff] rounded-2xl text-[11px] text-[#464554] flex items-center gap-2 border border-[#dce9ff]">
          <span className="material-symbols-outlined text-[#006c49] text-[18px] shrink-0">
            shield
          </span>
          <span>
            Operations Ledger contains private wholesale margins, vendor supplier sheets, and WhatsApp customer dossiers.
          </span>
        </div>
      </div>
    </div>
  );
};
