import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Users, BarChart3, Clock } from 'lucide-react';
import { collection } from '../lib/api';
import { useAdmin } from './AdminContext';

const statusLabels = {
  new: 'Nouveau',
  read: 'Lu',
  replied: 'Répondu',
  archived: 'Archivé',
};

const statusColors = {
  new: 'bg-brand-gold/20 text-neutral-900',
  read: 'bg-brand-tealLight text-brand-teal',
  replied: 'bg-green-50 text-success',
  archived: 'bg-neutral-100 text-neutral-500',
};

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState({ total: 0, new: 0, thisWeek: 0, byDept: {} });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const allSubmissions = await collection('contact_submissions').getFullList({ sort: '-created' });
        setRecent(allSubmissions.slice(0, 5));

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const total = allSubmissions.length;
        const newCount = allSubmissions.filter((s) => s.status === 'new').length;
        const thisWeek = allSubmissions.filter((s) => new Date(s.created) >= oneWeekAgo).length;
        const byDept = {};
        allSubmissions.forEach((s) => {
          byDept[s.department] = (byDept[s.department] || 0) + 1;
        });

        setStats({ total, new: newCount, thisWeek, byDept });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin-slow h-10 w-10 text-brand-navy"><svg viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg></div></div>;
  }

  const statCards = [
    { label: 'Total messages', value: stats.total, icon: Mail, color: 'bg-brand-navy/10 text-brand-navy' },
    { label: 'Nouveaux', value: stats.new, icon: Users, color: 'bg-brand-gold/20 text-neutral-900' },
    { label: 'Cette semaine', value: stats.thisWeek, icon: Clock, color: 'bg-brand-tealLight text-brand-teal' },
    { label: 'Départements', value: Object.keys(stats.byDept).length, icon: BarChart3, color: 'bg-green-50 text-success' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Tableau de bord</h1>
        <p className="mt-1 text-neutral-500">Bienvenue, {admin?.email || 'administrateur'}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-card border border-neutral-200/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{card.label}</p>
                  <p className="mt-1 font-display text-3xl font-bold text-neutral-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-xl shadow-card border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900">Messages récents</h2>
          <Link to="/admin/submissions" className="text-sm font-semibold text-brand-navy hover:text-brand-gold transition-colors duration-150">
            Voir tout →
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {recent.length === 0 ? (
            <p className="px-6 py-8 text-center text-neutral-500">Aucun message pour le moment.</p>
          ) : (
            recent.map((sub) => (
              <div key={sub.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors duration-150">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">{sub.full_name}</p>
                  <p className="text-sm text-neutral-500 truncate">{sub.subject}</p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest ${statusColors[sub.status] || statusColors.new}`}>
                    {statusLabels[sub.status] || sub.status}
                  </span>
                  <span className="text-xs text-neutral-400 hidden sm:block">
                    {new Date(sub.created).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
