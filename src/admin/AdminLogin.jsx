import { useState } from 'react';
import { useAdmin } from './AdminContext';
import Spinner from '../components/ui/Spinner';

export default function AdminLogin() {
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
            <rect width="32" height="32" rx="8" fill="#1C3F7A" />
            <path d="M8 16L14 10L14 14L24 14L24 18L14 18L14 22L8 16Z" fill="#F5A800" />
          </svg>
          <h1 className="font-display text-2xl font-bold text-neutral-900">Administration</h1>
          <p className="mt-2 text-neutral-500">Connectez-vous pour accéder au tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-neutral-200/60 p-6 md:p-8 space-y-5">
          {error && (
            <div className="rounded-xl p-4 bg-red-50 border border-error/30 text-error text-sm flex items-center gap-2 animate-error-shake">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-1.5">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-900 text-base font-sans placeholder:text-neutral-500 transition-all duration-200 focus:outline-none focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/20"
              placeholder="admin@solution4all.dz"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-1.5">
              Mot de passe
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-900 text-base font-sans placeholder:text-neutral-500 transition-all duration-200 focus:outline-none focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center font-display font-semibold rounded-lg px-5 py-2.5 text-base gap-2 bg-brand-gold text-neutral-900 shadow-sm hover:bg-brand-goldDark hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark focus-visible:ring-offset-2 transition-[color,background-color,transform,box-shadow] duration-250 ease-spring disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {loading && <Spinner size="sm" className="text-neutral-900" />}
            Se connecter
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          <a href="/" className="text-brand-navy hover:text-brand-gold transition-colors duration-150">
            ← Retour au site
          </a>
        </p>
      </div>
    </div>
  );
}
