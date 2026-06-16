import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { collection } from '../lib/api';
import { useAdmin } from './AdminContext';
import { formatDZD, formatDate, formatDateTime } from '../lib/format';
import { useToast } from '../components/ui/ToastContainer';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

const orderStatusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  processing: 'En traitement',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

const orderStatusColors = {
  pending: 'bg-brand-gold/20 text-neutral-900',
  confirmed: 'bg-brand-tealLight text-brand-teal',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-success',
  cancelled: 'bg-red-50 text-error',
};

const statusBadgeColors = {
  pending: 'gold',
  confirmed: 'teal',
  processing: 'blue',
  shipped: 'indigo',
  delivered: 'success',
  cancelled: 'error',
};

export default function AdminOrders() {
  const { admin } = useAdmin();
  const { toast } = useToast();

  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [originalAdminNotes, setOriginalAdminNotes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const filters = [];
      if (statusFilter) {
        filters.push(`status = "${statusFilter}"`);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        filters.push(
          `(customer_name ~ "${q}" || order_number ~ "${q}")`
        );
      }
      const filter = filters.join(' && ');
      const result = await collection('orders').getList(page, 20, {
        sort: '-created',
        filter: filter || undefined,
      });
      setOrders(result.items);
      setTotalCount(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast?.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setOriginalAdminNotes(order.admin_notes || '');
    setModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder || selectedOrder.status === newStatus) return;
    setUpdating(true);
    try {
      await collection('orders').update(selectedOrder.id, {
        status: newStatus,
      });
      toast?.success('Statut mis à jour avec succès');
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast?.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleAdminNotesUpdate = async () => {
    if (!selectedOrder) return;
    const currentNotes = selectedOrder.admin_notes || '';
    if (currentNotes === originalAdminNotes) {
      toast?.info('Aucune modification détectée');
      return;
    }
    setUpdating(true);
    try {
      await collection('orders').update(selectedOrder.id, {
        admin_notes: currentNotes,
      });
      toast?.success('Notes internes mises à jour avec succès');
      setOriginalAdminNotes(currentNotes);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update admin notes:', err);
      toast?.error('Erreur lors de la mise à jour des notes');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { key: 'order_number', label: 'N° commande' },
    { key: 'customer_name', label: 'Client' },
    { key: 'wilaya', label: 'Wilaya' },
    {
      key: 'total_dzd',
      label: 'Total',
      render: (val) => formatDZD(val),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val, row) => (
        <Badge color={statusBadgeColors[val] || 'neutral'}>
          {orderStatusLabels[val] || val}
        </Badge>
      ),
    },
    {
      key: 'created',
      label: 'Date',
      render: (val) => formatDate(val),
    },
  ];

  const renderOrderItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <p className="text-sm text-neutral-500">Aucun article</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Produit
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Qté
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Prix unitaire
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const qty = item.quantity || item.qty || 1;
              const unitPrice = item.price || item.unit_price || item.price_dzd || 0;
              return (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="px-3 py-2 text-neutral-900">
                    {item.name || item.name_fr || item.product_name || 'Produit'}
                  </td>
                  <td className="px-3 py-2 text-center text-neutral-700">{qty}</td>
                  <td className="px-3 py-2 text-right text-neutral-700">
                    {formatDZD(unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-neutral-900">
                    {formatDZD(unitPrice * qty)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Commandes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {totalCount} commande{totalCount > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-xl border border-neutral-200/60 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher par client ou n° commande…"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 py-2.5 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
          </div>
          <div className="sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(orderStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyMessage="Aucune commande trouvée."
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Order detail modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Commande #${selectedOrder?.order_number || ''}`}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest ${
                  orderStatusColors[selectedOrder.status] ||
                  'bg-neutral-100 text-neutral-700'
                }`}
              >
                {orderStatusLabels[selectedOrder.status] || selectedOrder.status}
              </span>
              <span className="text-sm text-neutral-500">
                {formatDateTime(selectedOrder.created)}
              </span>
            </div>

            {/* Customer info */}
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Informations client
              </h3>
              <div className="grid gap-3 rounded-xl bg-neutral-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-neutral-500">Nom :</span>{' '}
                  <span className="font-medium text-neutral-900">
                    {selectedOrder.customer_name}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Email :</span>{' '}
                  <span className="text-neutral-900">{selectedOrder.customer_email}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Tél :</span>{' '}
                  <span className="text-neutral-900">{selectedOrder.customer_phone}</span>
                </div>
                {selectedOrder.customer_company && (
                  <div>
                    <span className="text-neutral-500">Société :</span>{' '}
                    <span className="text-neutral-900">
                      {selectedOrder.customer_company}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-500">Wilaya :</span>{' '}
                  <span className="text-neutral-900">{selectedOrder.wilaya}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-neutral-500">Adresse :</span>{' '}
                  <span className="text-neutral-900">{selectedOrder.address}</span>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Articles commandés
              </h3>
              <div className="rounded-xl bg-neutral-50 p-4">
                {renderOrderItems(selectedOrder.items)}
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end text-sm">
              <div className="space-y-1">
                <div className="flex justify-between gap-8 text-neutral-500">
                  <span>Sous-total</span>
                  <span>
                    {formatDZD(
                      selectedOrder.subtotal_dzd || selectedOrder.total_dzd
                    )}
                  </span>
                </div>
                <div className="flex justify-between gap-8 border-t border-neutral-200 pt-1 font-display text-lg font-bold text-neutral-900">
                  <span>Total</span>
                  <span>{formatDZD(selectedOrder.total_dzd)}</span>
                </div>
              </div>
            </div>

            {/* Customer notes */}
            {selectedOrder.notes && (
              <div>
                <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                  Notes client
                </h3>
                <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            {/* Status update */}
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Mettre à jour le statut
              </h3>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updating}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 disabled:opacity-50"
                  >
                    {Object.entries(orderStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Admin notes */}
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Notes internes
              </h3>
              <textarea
                value={selectedOrder.admin_notes || ''}
                onChange={(e) =>
                  setSelectedOrder((prev) => ({
                    ...prev,
                    admin_notes: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Ajouter une note interne…"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAdminNotesUpdate}
                  loading={updating}
                >
                  Enregistrer les notes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
