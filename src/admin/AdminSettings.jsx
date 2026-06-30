import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './AdminContext';
import { api } from '../lib/api';
import { useToast } from '../components/ui/ToastContainer';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { User, Mail, Sliders, Lock, Plus, Key } from 'lucide-react';

export default function AdminSettings() {
  const { admin } = useAdmin();
  const toast = useToast();
  const isAdmin = admin?.role === 'admin';

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Password Form State
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // SMTP Form State
  const [smtpData, setSmtpData] = useState({
    host: '',
    port: 465,
    username: '',
    password: '',
    encryption: 'TLS',
    fromEmail: '',
  });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpFetching, setSmtpFetching] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Users State (Admin only)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);

  // ---- Tab 1: Profile logic ----
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    setProfileLoading(true);
    try {
      await api.patch('/users/change-my-password', {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
      });
      toast.success('Votre mot de passe a été modifié avec succès.');
      setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setProfileLoading(false);
    }
  };

  // ---- Tab 2: SMTP logic ----
  const fetchSmtpConfig = useCallback(async () => {
    if (!isAdmin) return;
    setSmtpFetching(true);
    try {
      const response = await api.get('/smtp-configs');
      if (response.data?.data) {
        setSmtpData(response.data.data);
        setTestEmail((prev) => prev || response.data.data.fromEmail || '');
      }
    } catch (err) {
      console.error('Failed to fetch SMTP config:', err);
    } finally {
      setSmtpFetching(false);
    }
  }, [isAdmin]);

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    setSmtpLoading(true);
    try {
      await api.put('/smtp-configs', smtpData);
      toast.success('Configuration SMTP enregistrée avec succès.');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'enregistrement SMTP.");
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestLoading(true);
    try {
      const recipient = (testEmail || '').trim() || smtpData.fromEmail || smtpData.username;
      const res = await api.post('/smtp-configs/test', { ...smtpData, to: recipient });
      toast.success(res.data?.message || `Email de test envoyé à ${recipient}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de l'envoi de l'email de test.");
    } finally {
      setTestLoading(false);
    }
  };

  // ---- Tab 3: Users logic ----
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data?.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des membres.');
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin, toast]);

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreateUserLoading(true);
    try {
      await api.post('/users', newUserData);
      toast.success('Membre créé avec succès.');
      setCreateUserModalOpen(false);
      setNewUserData({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setCreateUserLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'smtp') {
      fetchSmtpConfig();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchSmtpConfig, fetchUsers]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Paramètres</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gérez votre profil, les rôles des utilisateurs et la messagerie système.
        </p>
      </div>

      {/* Tabs list */}
      <div className="mb-8 border-b border-neutral-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-200 ${
              activeTab === 'profile'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User size={16} />
            Mon Profil
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('smtp')}
                className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-200 ${
                  activeTab === 'smtp'
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Sliders size={16} />
                Configuration SMTP
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Sliders size={16} />
                Membres & Rôles
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-card">
        {/* Mon Profil */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-950 flex items-center gap-2">
              <Lock size={18} className="text-brand-navy" />
              Modifier mon mot de passe
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  required
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  placeholder="Saisissez votre mot de passe actuel"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  placeholder="Nouveau mot de passe"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  placeholder="Confirmez le nouveau mot de passe"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-navyDark disabled:opacity-50 transition-colors duration-150"
              >
                {profileLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        )}

        {/* SMTP Configuration */}
        {activeTab === 'smtp' && isAdmin && (
          smtpFetching ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <form onSubmit={handleSmtpSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-950 flex items-center gap-2">
                <Sliders size={18} className="text-brand-navy" />
                Configuration du serveur SMTP
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Hôte SMTP (Host)
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpData.host}
                    onChange={(e) => setSmtpData({ ...smtpData, host: e.target.value })}
                    placeholder="ex: smtp.example.dz"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Port SMTP
                  </label>
                  <input
                    type="number"
                    required
                    value={smtpData.port}
                    onChange={(e) => setSmtpData({ ...smtpData, port: parseInt(e.target.value) })}
                    placeholder="ex: 465 ou 587"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Utilisateur SMTP / Email de connexion
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpData.username}
                    onChange={(e) => setSmtpData({ ...smtpData, username: e.target.value })}
                    placeholder="ex: contact@example.dz"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Chiffrement
                  </label>
                  <select
                    value={smtpData.encryption}
                    onChange={(e) => setSmtpData({ ...smtpData, encryption: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                  >
                    <option value="TLS">TLS</option>
                    <option value="SSL">SSL</option>
                    <option value="none">Aucun (Non sécurisé)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Mot de passe SMTP
                  </label>
                  <input
                    type="password"
                    required
                    value={smtpData.password}
                    onChange={(e) => setSmtpData({ ...smtpData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Adresse Expéditeur (From Email)
                  </label>
                  <input
                    type="email"
                    required
                    value={smtpData.fromEmail}
                    onChange={(e) => setSmtpData({ ...smtpData, fromEmail: e.target.value })}
                    placeholder="ex: noreply@example.dz"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
                {/* Test email */}
                <div className="w-full sm:max-w-sm">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Envoyer un email de test à
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder={smtpData.fromEmail || 'ex: test@example.dz'}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={testLoading}
                      className="inline-flex shrink-0 items-center rounded-xl border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy hover:text-white disabled:opacity-50 transition-colors duration-150"
                    >
                      {testLoading ? <Spinner size="sm" className="mr-2" /> : null}
                      Envoyer un email de test
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={smtpLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-navyDark disabled:opacity-50 transition-colors duration-150"
                >
                  {smtpLoading ? <Spinner size="sm" className="mr-2" /> : null}
                  Enregistrer les paramètres SMTP
                </button>
              </div>
            </form>
          )
        )}

        {/* Membres & Rôles */}
        {activeTab === 'users' && isAdmin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-950 flex items-center gap-2">
                <User size={18} className="text-brand-navy" />
                Liste des Membres
              </h3>
              <button
                onClick={() => setCreateUserModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-navyDark transition-colors duration-150"
              >
                <Plus size={16} />
                Ajouter un membre
              </button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-neutral-100">
                        <td className="px-4 py-3 font-medium text-neutral-900">{u.name}</td>
                        <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge color={u.role === 'admin' ? 'navy' : 'teal'}>
                            {u.role === 'admin' ? 'Administrateur' : 'Standard'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={u.status === 'active' ? 'success' : 'gold'}>
                            {u.status === 'active' ? 'Actif' : 'En attente'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add Member */}
      {createUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-neutral-200 p-6 shadow-xl animate-scale-up">
            <h2 className="font-display text-xl font-bold text-neutral-950 mb-4">Créer un membre</h2>
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="ex: Karim Hadj"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Adresse Email (Obligatoire)
                </label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="ex: karim@example.dz"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Mot de passe (Obligatoire)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Rôle
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-brand-navy focus:bg-white focus:outline-none"
                >
                  <option value="user">Utilisateur standard</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateUserModalOpen(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createUserLoading}
                  className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navyDark disabled:opacity-50 transition-colors flex items-center"
                >
                  {createUserLoading ? <Spinner size="sm" className="mr-1.5" /> : null}
                  Créer le membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
