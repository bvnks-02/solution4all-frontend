// FILE: solution4all-frontend/src/admin/AdminForgotPassword.jsx
import { useState } from 'react';
import { api } from '../lib/api';
import Spinner from '../components/ui/Spinner';

export default function AdminForgotPassword({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (err) {
      // Intentionally silent — never reveal whether email exists
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-neutral-200 p-6 shadow-xl">
        <h2 className="font-display text-xl font-bold text-neutral-950 mb-2">Mot de passe oublié</h2>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Si un compte correspond à cet email, un lien de réinitialisation vous a été envoyé.
              Vérifiez votre boîte de réception.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-brand-navy py-2.5 text-sm font-semibold text-white hover:bg-brand-navyDark transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-neutral-500">
              Saisissez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.dz"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-brand-navy py-2.5 text-sm font-semibold text-white hover:bg-brand-navyDark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Spinner size="sm" />}
                Envoyer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
