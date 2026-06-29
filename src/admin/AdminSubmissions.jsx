import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, Trash2, CheckCheck, Reply, Archive } from 'lucide-react';
import { collection } from '../lib/api';
import { useAdmin } from './AdminContext';
import { formatDateTime } from '../lib/format';
import { useToast } from '../components/ui/ToastContainer';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

// Simple debounce hook
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const departmentLabels = {
  general: 'Général',
  commercial: 'Commercial',
  ecommerce: 'E-commerce',
  technical: 'Technique',
};

const statusLabels = {
  new: 'Nouveau',
  read: 'Lu',
  replied: 'Répondu',
  archived: 'Archivé',
};

const statusBadgeColors = {
  new: 'blue',
  read: 'gray',
  replied: 'success',
  archived: 'neutral',
};

export default function AdminSubmissions() {
  const { admin } = useAdmin();
  const toast = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Debounce search to avoid firing requests on every keystroke
  const debouncedSearch = useDebounce(searchQuery, 300);

  // AbortController ref to cancel stale in-flight requests
  const abortRef = useRef(null);

  // ---- Data fetching ----

  const fetchSubmissions = useCallback(async () => {
    // Cancel any previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const filters = [];
      if (statusFilter) {
        filters.push(`status = "${statusFilter}"`);
      }
      if (departmentFilter) {
        filters.push(`department = "${departmentFilter}"`);
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim();
        filters.push(
          `(full_name ~ "${q}" || email ~ "${q}" || subject ~ "${q}")`
        );
      }
      const filter = filters.join(' && ');

      // Fetch the paginated list + a lightweight count of new submissions
      const [listResult, newResult] = await Promise.all([
        collection('contact_submissions').getList(page, 20, {
          sort: '-created',
          filter: filter || undefined,
          signal: controller.signal,
        }),
        // Use perPage=1 and read totalItems from meta — avoids loading 500 records
        // just to show the "N nouveaux" badge
        collection('contact_submissions').getList(1, 1, {
          filter: 'status = "new"',
          signal: controller.signal,
        }),
      ]);

      setSubmissions(listResult.items);
      setTotalCount(listResult.totalItems);
      setTotalPages(listResult.totalPages);
      setNewCount(newResult.totalItems);
    } catch (err) {
      // Ignore aborted requests (from rapid filter changes) silently
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      if (err?.code !== 'ERR_NETWORK' && err?.response?.status !== 404) {
        console.error('Failed to fetch submissions:', err);
      }
      toast?.error('Erreur lors du chargement des messages');
    } finally {
      // Don't clear loading for a request that was superseded — the newer
      // in-flight request owns the loading state.
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [page, statusFilter, departmentFilter, debouncedSearch, toast]);

  useEffect(() => {
    fetchSubmissions();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchSubmissions]);

  // ---- Selection handling ----

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map((s) => s.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  // ---- Bulk actions ----

  const bulkUpdateStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          collection('contact_submissions').update(id, { status: newStatus })
        )
      );
      toast?.success(
        `${selectedIds.length} message${selectedIds.length > 1 ? 's' : ''} mis à jour avec succès`
      );
      setSelectedIds([]);
      fetchSubmissions();
    } catch (err) {
      console.error('Failed to bulk update status:', err);
      toast?.error('Erreur lors de la mise à jour en masse');
    } finally {
      setBulkUpdating(false);
    }
  };

  // ---- View details ----

  const handleRowClick = (submission) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  // ---- Status update in modal ----

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedSubmission || selectedSubmission.status === newStatus) return;
    setUpdating(true);
    try {
      await collection('contact_submissions')
        .update(selectedSubmission.id, { status: newStatus });
      toast?.success('Statut mis à jour avec succès');
      setSelectedSubmission((prev) => ({ ...prev, status: newStatus }));
      fetchSubmissions();
    } catch (err) {
      console.error('Failed to update submission status:', err);
      toast?.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  // ---- Delete ----

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await collection('contact_submissions').delete(deleteTarget.id);
      toast?.success('Message supprimé avec succès');
      setDeleteTarget(null);
      if (modalOpen && selectedSubmission?.id === deleteTarget.id) {
        setModalOpen(false);
        setSelectedSubmission(null);
      }
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      fetchSubmissions();
    } catch (err) {
      console.error('Failed to delete submission:', err);
      toast?.error('Erreur lors de la suppression du message');
    } finally {
      setDeleting(false);
    }
  };

  // ---- Table columns ----

  const columns = [
    {
      key: '_select',
      label: (
        <input
          type="checkbox"
          checked={
            submissions.length > 0 &&
            selectedIds.length === submissions.length
          }
          onChange={toggleSelectAll}
          className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
        />
      ),
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelect(row.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
        />
      ),
    },
    {
      key: 'created',
      label: 'Date',
      render: (val) => (
        <span className="text-sm text-neutral-600">
          {formatDateTime(val)}
        </span>
      ),
    },
    { key: 'full_name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    {
      key: 'department',
      label: 'Département',
      render: (val) => (
        <span className="text-sm text-neutral-600">
          {departmentLabels[val] || val}
        </span>
      ),
    },
    { key: 'subject', label: 'Sujet' },
    {
      key: 'status',
      label: 'Statut',
      render: (val) => (
        <Badge color={statusBadgeColors[val] || 'neutral'}>
          {statusLabels[val] || val}
        </Badge>
      ),
    },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(row);
            }}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-brand-navy hover:bg-neutral-100 transition-colors duration-150"
            title="Voir les détails"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-error hover:bg-red-50 transition-colors duration-150"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ---- Render ----

  const renderMetadata = (submission) => {
    const fields = [];
    if (submission.ip_address) {
      fields.push({ label: 'Adresse IP', value: submission.ip_address });
    }
    if (submission.user_agent) {
      fields.push({ label: 'Navigateur', value: submission.user_agent });
    }
    if (submission.source_page) {
      fields.push({ label: 'Page source', value: submission.source_page });
    }
    if (submission.created) {
      fields.push({ label: 'Date de soumission', value: formatDateTime(submission.created) });
    }
    if (submission.updated) {
      fields.push({ label: 'Dernière modification', value: formatDateTime(submission.updated) });
    }
    if (fields.length === 0) return null;

    return (
      <div>
        <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
          Métadonnées
        </h3>
        <div className="rounded-xl bg-neutral-50 p-4 text-sm">
          {fields.map((f, i) => (
            <div
              key={i}
              className={`flex flex-col sm:flex-row sm:gap-2 ${
                i < fields.length - 1 ? 'mb-2 pb-2 border-b border-neutral-200' : ''
              }`}
            >
              <span className="text-neutral-500 sm:min-w-[140px] font-medium">
                {f.label}
              </span>
              <span className="text-neutral-800 break-words">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-neutral-900">
              Messages
            </h1>
            {newCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-navy/10 px-3 py-0.5 text-xs font-semibold text-brand-navy">
                {newCount} nouveau{newCount > 1 ? 'x' : ''}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {totalCount} message{totalCount > 1 ? 's' : ''} — Gestion des messages de contact
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-xl border border-neutral-200/60 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
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
              placeholder="Rechercher par nom, email ou sujet…"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 py-2.5 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
          </div>

          {/* Status filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div className="sm:w-48">
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="">Tous les départements</option>
              {Object.entries(departmentLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-navy/20 bg-brand-navy/5 p-3">
          <span className="text-sm font-medium text-neutral-700">
            {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bulkUpdateStatus('read')}
              loading={bulkUpdating}
            >
              <CheckCheck size={16} />
              Marquer comme lu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bulkUpdateStatus('replied')}
              loading={bulkUpdating}
            >
              <Reply size={16} />
              Marquer comme répondu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bulkUpdateStatus('archived')}
              loading={bulkUpdating}
            >
              <Archive size={16} />
              Archiver
            </Button>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-150"
          >
            Annuler la sélection
          </button>
        </div>
      )}

      {/* Submissions table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={submissions}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyMessage="Aucun message trouvé."
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Detail modal (read-only) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSubmission(null);
        }}
        title="Détails du message"
        size="xl"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            {/* Status badge + date */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                color={
                  statusBadgeColors[selectedSubmission.status] || 'neutral'
                }
              >
                {statusLabels[selectedSubmission.status] ||
                  selectedSubmission.status}
              </Badge>
              <span className="text-sm text-neutral-500">
                {formatDateTime(selectedSubmission.created)}
              </span>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Informations de contact
              </h3>
              <div className="grid gap-3 rounded-xl bg-neutral-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-neutral-500">Nom :</span>{' '}
                  <span className="font-medium text-neutral-900">
                    {selectedSubmission.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Email :</span>{' '}
                  <span className="text-neutral-900">
                    {selectedSubmission.email}
                  </span>
                </div>
                {selectedSubmission.phone && (
                  <div>
                    <span className="text-neutral-500">Téléphone :</span>{' '}
                    <span className="text-neutral-900">
                      {selectedSubmission.phone}
                    </span>
                  </div>
                )}
                {selectedSubmission.company && (
                  <div>
                    <span className="text-neutral-500">Société :</span>{' '}
                    <span className="text-neutral-900">
                      {selectedSubmission.company}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-500">Département :</span>{' '}
                  <span className="text-neutral-900">
                    {departmentLabels[selectedSubmission.department] ||
                      selectedSubmission.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject & Message */}
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Sujet
              </h3>
              <p className="rounded-xl bg-neutral-50 p-4 text-sm font-medium text-neutral-900">
                {selectedSubmission.subject}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Message
              </h3>
              <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700 whitespace-pre-wrap break-words">
                {selectedSubmission.message}
              </div>
            </div>

            {/* Metadata */}
            {renderMetadata(selectedSubmission)}

            {/* Status update */}
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold text-neutral-900">
                Modifier le statut
              </h3>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updating}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 disabled:opacity-50"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-error hover:text-error"
                onClick={() => setDeleteTarget(selectedSubmission)}
              >
                <Trash2 size={16} />
                Supprimer
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedSubmission(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-700">
            Êtes-vous sûr de vouloir supprimer le message de{' '}
            <span className="font-semibold text-neutral-900">
              {deleteTarget?.full_name}
            </span>{' '}
            ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setDeleteTarget(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="bg-error text-white hover:bg-red-700"
              onClick={confirmDelete}
              loading={deleting}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
