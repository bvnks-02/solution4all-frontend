// FILE: solution4all-frontend/src/admin/AdminTrash.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { useAdmin } from './AdminContext';
import { formatDZD, formatDateTime } from '../lib/format';
import { useToast } from '../components/ui/ToastContainer';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

export default function AdminTrash() {
  const { admin, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState(null);
  const [hardDeleting, setHardDeleting] = useState(false);

  // Redirect non-admins
  if (!isAdmin) {
    navigate('/admin', { replace: true });
    return null;
  }

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/trash');
      setProducts(res.data?.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement de la corbeille');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (id) => {
    setRestoring(id);
    try {
      await api.patch(`/products/${id}/restore`);
      toast.success('Produit restauré avec succès');
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      toast.error('Erreur lors de la restauration');
    } finally {
      setRestoring(null);
    }
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    setHardDeleting(true);
    try {
      await api.delete(`/products/${hardDeleteTarget}/hard`);
      toast.success('Produit supprimé définitivement');
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== hardDeleteTarget));
      setHardDeleteTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la suppression définitive';
      toast.error(msg);
      setHardDeleteTarget(null);
    } finally {
      setHardDeleting(false);
    }
  };

  const columns = [
    { key: 'name_fr', label: 'Nom du produit' },
    { key: 'category', label: 'Catégorie' },
    {
      key: 'price_dzd',
      label: 'Prix',
      render: (val) => formatDZD(val),
    },
    {
      key: 'deletedAt',
      label: 'Supprimé le',
      render: (val) => formatDateTime(val),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (val, row) => {
        const id = row._id || row.id;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRestore(id); }}
              disabled={restoring === id}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-navyDark disabled:opacity-50 transition-colors"
            >
              {restoring === id ? <Spinner size="xs" /> : <RotateCcw size={13} />}
              Restaurer
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setHardDeleteTarget(id); }}
              className="inline-flex items-center gap-1 rounded-lg bg-error px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 size={13} />
              Suppr. définitivement
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Trash2 size={22} className="text-neutral-400" />
            Corbeille
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} produit{products.length > 1 ? 's' : ''} supprimé{products.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Trash2 size={48} strokeWidth={1} />
            <p className="mt-4 text-sm font-medium">La corbeille est vide</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={products}
            page={1}
            totalPages={1}
            emptyMessage="La corbeille est vide"
          />
        )}
      </div>

      {/* Hard delete confirmation modal */}
      <Modal
        isOpen={!!hardDeleteTarget}
        onClose={() => setHardDeleteTarget(null)}
        title="Confirmer la suppression définitive"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-error shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-700">
              Cette action est <strong>irréversible</strong>. Le produit sera définitivement supprimé de la base de données.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="md" onClick={() => setHardDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="bg-error text-white hover:bg-red-700"
              onClick={confirmHardDelete}
              loading={hardDeleting}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
