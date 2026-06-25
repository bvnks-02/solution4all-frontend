import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useForm } from 'react-hook-form';
import { collection } from '../lib/api';
import { useAdmin } from './AdminContext';
import { useToast } from '../components/ui/ToastContainer';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

/**
 * Safely parse a JSON field that may be a string, array, or object.
 */
function parseJsonField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  // If it's a byte array (e.g. {"0": 91, "1": 34, ...})
  if (typeof value === 'object' && !Array.isArray(value)) {
    try {
      const chars = Object.values(value);
      const str = String.fromCharCode(...chars.map((v) => Number(v)));
      return JSON.parse(str);
    } catch {
      return [];
    }
  }
  // If it's a string, try parsing
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Generate a slug from a French title.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminServices() {
  const { admin } = useAdmin();
  const toast = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const watchTitleFr = watch('title_fr');
  const watchSlug = watch('slug');
  const watchIconName = watch('icon_name');

  // ---- Data fetching ----

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const filters = [];
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        filters.push(`(title_fr ~ "${q}" || slug ~ "${q}")`);
      }
      if (activeOnly) {
        filters.push('active = true');
      }
      const filter = filters.join(' && ');
      const result = await collection('services').getList(1, 200, {
        sort: 'sort_order',
        filter: filter || undefined,
      });
      setServices(result.items);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      toast?.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeOnly, toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Auto-generate slug from title when creating
  useEffect(() => {
    if (!editingService && watchTitleFr && !watchSlug) {
      setValue('slug', slugify(watchTitleFr));
    }
  }, [watchTitleFr, watchSlug, editingService, setValue]);

  // ---- Dynamic features helpers ----

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setFeatures((prev) => [...prev, trimmed]);
    setNewFeature('');
  };

  const removeFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  // ---- Form helpers ----

  const openCreateForm = () => {
    setEditingService(null);
    setFeatures([]);
    setNewFeature('');
    reset({
      slug: '',
      title_fr: '',
      description_fr: '',
      icon_name: '',
      color_class: '',
      sort_order: (services.length > 0 ? Math.max(...services.map((s) => s.sort_order ?? 0)) + 1 : 1).toString(),
      active: true,
    });
    setModalOpen(true);
  };

  const openEditForm = (service) => {
    setEditingService(service);
    const parsedFeatures = parseJsonField(service.features);
    setFeatures(parsedFeatures);
    setNewFeature('');
    reset({
      slug: service.slug || '',
      title_fr: service.title_fr || '',
      description_fr: service.description_fr || '',
      icon_name: service.icon_name || '',
      color_class: service.color_class || '',
      sort_order: service.sort_order ?? '',
      active: service.active ?? true,
    });
    setModalOpen(true);
  };

  const handleRowClick = (service) => {
    openEditForm(service);
  };

  // ---- Inline toggle active ----

  const toggleActive = async (service, e) => {
    e.stopPropagation();
    setTogglingId(service.id);
    try {
      await collection('services').update(service.id, {
        active: !service.active,
      });
      toast?.success(
        `Service ${service.active ? 'désactivé' : 'activé'} avec succès`
      );
      fetchServices();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      toast?.error('Erreur lors de la modification du statut');
    } finally {
      setTogglingId(null);
    }
  };

  // ---- Reorder ----

  const moveService = async (index, direction) => {
    const sorted = [...services].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const currentIndex = sorted.findIndex((s) => s.id === services[index]?.id);
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[currentIndex];
    const target = sorted[targetIndex];
    const currentOrder = current.sort_order ?? 0;
    const targetOrder = target.sort_order ?? 0;

    try {
      await collection('services').update(current.id, { sort_order: targetOrder });
      await collection('services').update(target.id, { sort_order: currentOrder });
      toast?.success('Ordre mis à jour avec succès');
      fetchServices();
    } catch (err) {
      console.error('Failed to reorder services:', err);
      toast?.error('Erreur lors du réordonnancement');
    }
  };

  // ---- Form submit ----

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        slug: data.slug,
        title_fr: data.title_fr,
        description_fr: data.description_fr || '',
        icon_name: data.icon_name,
        color_class: data.color_class || '',
        features: JSON.stringify(features),
        sort_order: Number(data.sort_order) || 0,
        active: !!data.active,
      };

      if (editingService) {
        await collection('services').update(editingService.id, payload);
        toast?.success('Service mis à jour avec succès');
      } else {
        await collection('services').create(payload);
        toast?.success('Service créé avec succès');
      }

      setModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      console.error('Failed to save service:', err);
      const respData = err.response?.data || err.data?.data || err.data || {};
      const fieldErrors = Object.entries(respData)
        .filter(([key]) => key !== 'message')
        .map(([key, val]) => `${key}: ${val.message || val.code || JSON.stringify(val)}`)
        .join(', ');
      toast?.error(fieldErrors || err.message || "Erreur lors de l'enregistrement du service");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Delete ----

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await collection('services').delete(deleteTarget.id);
      toast?.success('Service supprimé avec succès');
      setDeleteTarget(null);
      if (modalOpen && editingService?.id === deleteTarget.id) {
        setModalOpen(false);
        setEditingService(null);
      }
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
      toast?.error('Erreur lors de la suppression du service');
    } finally {
      setDeleting(false);
    }
  };

  // ---- Icon preview component ----

  const IconPreview = ({ iconName, className = 'h-5 w-5' }) => {
    if (!iconName) return null;
    const Icon = LucideIcons[iconName];
    if (!Icon) {
      return (
        <span className={`inline-flex items-center justify-center rounded bg-neutral-100 text-neutral-400 ${className}`} title={`"${iconName}" introuvable`}>
          <X size={14} />
        </span>
      );
    }
    return <Icon className={className} />;
  };

  // ---- Table columns ----

  const columns = [
    {
      key: 'sort_order',
      label: 'Ordre',
      render: (val, row) => {
        const idx = services.findIndex((s) => s.id === row.id);
        return (
          <div className="flex items-center gap-1">
            <span className="w-6 text-center text-sm text-neutral-500">{val ?? '-'}</span>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveService(idx, -1); }}
                disabled={idx === 0}
                className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Monter"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveService(idx, 1); }}
                disabled={idx === services.length - 1}
                className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Descendre"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: 'icon_name',
      label: 'Icône',
      render: (val) => <IconPreview iconName={val} className="h-6 w-6 text-brand-navy" />,
    },
    { key: 'title_fr', label: 'Titre' },
    {
      key: 'active',
      label: 'Statut',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Badge color={val ? 'success' : 'error'}>
            {val ? 'Actif' : 'Inactif'}
          </Badge>
          <button
            type="button"
            onClick={(e) => toggleActive(row, e)}
            disabled={togglingId === row.id}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150 disabled:opacity-50"
            title={val ? 'Désactiver' : 'Activer'}
          >
            {togglingId === row.id ? (
              <Spinner size="sm" />
            ) : val ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            Services
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {services.length} service{services.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateForm}>
          <Plus size={18} />
          Ajouter un service
        </Button>
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
              }}
              placeholder="Rechercher par titre ou slug…"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 py-2.5 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
          </div>

          {/* Active only toggle */}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-700 transition-all duration-200 hover:border-neutral-400">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
              }}
              className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
            />
            Actifs uniquement
          </label>
        </div>
      </div>

      {/* Services table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={services}
            emptyMessage="Aucun service trouvé."
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Service form modal (create / edit) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingService(null);
        }}
        title={editingService ? 'Modifier le service' : 'Ajouter un service'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Two-column grid for text fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Slug <span className="text-error">*</span>
              </label>
              <input
                id="slug"
                {...register('slug', { required: 'Le slug est requis' })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-error">{errors.slug.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title_fr"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Titre (français) <span className="text-error">*</span>
              </label>
              <input
                id="title_fr"
                {...register('title_fr', { required: 'Le titre est requis' })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              {errors.title_fr && (
                <p className="mt-1 text-xs text-error">
                  {errors.title_fr.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="description_fr"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description_fr"
                {...register('description_fr', { required: 'La description est requise' })}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              {errors.description_fr && (
                <p className="mt-1 text-xs text-error">
                  {errors.description_fr.message}
                </p>
              )}
            </div>

            {/* Icon name */}
            <div>
              <label
                htmlFor="icon_name"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Nom de l'icône (lucide-react) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="icon_name"
                  {...register('icon_name', { required: "Le nom de l'icône est requis" })}
                  placeholder="ex: Settings, Shield, Wifi…"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 pr-12 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                />
                {watchIconName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <IconPreview iconName={watchIconName} className="h-5 w-5 text-brand-navy" />
                  </div>
                )}
              </div>
              {errors.icon_name && (
                <p className="mt-1 text-xs text-error">
                  {errors.icon_name.message}
                </p>
              )}
            </div>

            {/* Color class */}
            <div>
              <label
                htmlFor="color_class"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Classe de couleur (Tailwind)
              </label>
              <input
                id="color_class"
                {...register('color_class')}
                placeholder="ex: blue, green, purple…"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>

            {/* Sort order */}
            <div>
              <label
                htmlFor="sort_order"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Ordre d'affichage <span className="text-error">*</span>
              </label>
              <input
                id="sort_order"
                type="number"
                min="0"
                step="1"
                {...register('sort_order', {
                  required: "L'ordre d'affichage est requis",
                  min: { value: 0, message: "L'ordre ne peut pas être négatif" },
                })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              {errors.sort_order && (
                <p className="mt-1 text-xs text-error">
                  {errors.sort_order.message}
                </p>
              )}
            </div>
          </div>

          {/* Active checkbox */}
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                {...register('active')}
                className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
              />
              Actif
            </label>
          </div>

          {/* Features dynamic list */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700">
              Caractéristiques <span className="text-error">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={handleFeatureKeyDown}
                placeholder="Ajouter une caractéristique…"
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addFeature}
                disabled={!newFeature.trim()}
              >
                <Plus size={16} />
                Ajouter
              </Button>
            </div>
            {features.length === 0 ? (
              <p className="text-sm text-neutral-400 italic">
                Aucune caractéristique. Ajoutez-en au moins une.
              </p>
            ) : (
              <ul className="space-y-2">
                {features.map((feat, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="rounded-lg p-1 text-neutral-400 hover:text-error hover:bg-red-50 transition-colors duration-150"
                      title="Supprimer"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-5">
            {/* Delete button (edit mode only) */}
            {editingService && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-error hover:text-error"
                onClick={() => setDeleteTarget(editingService)}
              >
                <Trash2 size={16} />
                Supprimer
              </Button>
            )}
            <div className="ml-auto flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setModalOpen(false);
                  setEditingService(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary" size="md" loading={submitting}>
                {editingService ? 'Enregistrer' : 'Ajouter le service'}
              </Button>
            </div>
          </div>
        </form>
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
            Êtes-vous sûr de vouloir supprimer le service{' '}
            <span className="font-semibold text-neutral-900">
              {deleteTarget?.title_fr}
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
