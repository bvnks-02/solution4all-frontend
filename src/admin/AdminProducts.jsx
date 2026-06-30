import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Star, Trash2, X, ImageIcon, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { collection, uploadFile, API_URL, getFileURL } from '../lib/api';
import { useAdmin } from './AdminContext';
import { formatDZD } from '../lib/format';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/ui/ToastContainer';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import PermissionGate from '../components/ui/PermissionGate';
import { Link } from 'react-router-dom';

const categoryLabels = {
  ordinateurs: 'Ordinateurs',
  imprimantes: 'Imprimantes',
  onduleurs: 'Onduleurs',
  serveurs: 'Serveurs',
  consommables: 'Consommables',
  logiciels: 'Logiciels',
  licences: 'Licences logicielles',
};

/**
 * Generate an image URL for a product image.
 * Express backend serves files from /uploads/products/
 */
function getImageUrl(product, filename) {
  if (!filename || !product?.id) return null;
  const baseUrl = API_URL.replace('/api/v1', '');
  return `${baseUrl}/uploads/products/${filename}`;
}

export default function AdminProducts() {
  const { admin } = useAdmin();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [removedImageNames, setRemovedImageNames] = useState([]);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashedProducts, setTrashedProducts] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const isAdmin = admin?.role === 'admin';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // ---- Data fetching ----

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filters = [];
      if (categoryFilter) {
        filters.push(`category = "${categoryFilter}"`);
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim();
        filters.push(`(name_fr ~ "${q}" || slug ~ "${q}")`);
      }
      if (activeOnly) {
        filters.push('active = true');
      }
      const filter = filters.join(' && ');
      let result;
      try {
        result = await collection('products').getList(page, 20, {
          sort: '-featured,name_fr',
          filter: filter || undefined,
        });
      } catch (sortErr) {
        // Fallback: sort by name only if featured field causes issues
        console.warn('Sort by featured failed, falling back:', sortErr);
        result = await collection('products').getList(page, 20, {
          sort: 'name_fr',
          filter: filter || undefined,
          });
      }
      setProducts(result.items);
      setTotalCount(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast?.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, debouncedSearch, activeOnly, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Selection clears whenever the visible result set changes (filters / page).
  useEffect(() => {
    setSelectedIds([]);
  }, [page, categoryFilter, debouncedSearch, activeOnly]);

  const toggleRow = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = (checked) =>
    setSelectedIds(checked ? products.map((p) => p.id) : []);

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => collection('products').delete(id)));
      toast?.success(
        `${selectedIds.length} produit${selectedIds.length > 1 ? 's déplacés' : ' déplacé'} dans la corbeille`
      );
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      toast?.error('Erreur lors de la suppression groupée');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ---- Form helpers ----

  const openCreateForm = () => {
    setEditingProduct(null);
    reset({
      slug: '',
      name_fr: '',
      description_fr: '',
      price_dzd: '',
      category: '',
      stock: '',
      sku: '',
      brand: '',
      active: true,
      featured: false,
    });
    setNewImageFiles([]);
    setRemovedImageNames([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    reset({
      slug: product.slug || '',
      name_fr: product.name_fr || '',
      description_fr: product.description_fr || '',
      price_dzd: product.price_dzd ?? '',
      category: product.category || '',
      stock: product.stock ?? '',
      sku: product.sku || '',
      brand: product.brand || '',
      active: product.active ?? true,
      featured: product.featured ?? false,
    });
    setNewImageFiles([]);
    setRemovedImageNames([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const handleRowClick = (product) => {
    openEditForm(product);
  };

  // ---- Image handling ----

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const existingCount = editingProduct
      ? (editingProduct.images || []).filter(
          (name) => !removedImageNames.includes(name)
        ).length
      : 0;
    const totalCount = existingCount + newImageFiles.length + files.length;

    if (totalCount > 5) {
      toast?.error('Maximum 5 images autorisées');
      e.target.value = '';
      return;
    }

    setNewImageFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeExistingImage = (imageName) => {
    setRemovedImageNames((prev) => [...prev, imageName]);
  };

  const removeNewFile = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Form submit ----

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('slug', data.slug);
      formData.append('name_fr', data.name_fr);
      formData.append('description_fr', data.description_fr || '');
      formData.append('price_dzd', Number(data.price_dzd));
      formData.append('category', data.category);
      const stockVal = Number(data.stock);
      formData.append('stock', isNaN(stockVal) ? 0 : stockVal);
      formData.append('sku', data.sku || '');
      formData.append('brand', data.brand || '');
      formData.append('active', data.active ? 'true' : 'false');
      formData.append('featured', data.featured ? 'true' : 'false');

      if (editingProduct) {
        // Update mode
        // Append new file uploads
        for (const file of newImageFiles) {
          formData.append('images', file);
        }
        // Tell backend which existing images to remove
        if (removedImageNames.length > 0) {
          formData.append('removedImages', JSON.stringify(removedImageNames));
        }

        await uploadFile(`/products/${editingProduct.id}`, formData, 'put');
        toast?.success('Produit mis à jour avec succès');
      } else {
        // Create mode
        for (const file of newImageFiles) {
          formData.append('images', file);
        }
        await uploadFile('/products', formData, 'post');
        toast?.success('Produit créé avec succès');
      }

      setModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      const data = err.response?.data || err.data?.data || err.data || {};
      const fieldErrors = Object.entries(data)
        .filter(([key]) => key !== 'message')
        .map(([key, val]) => `${key}: ${val.message || val.code || JSON.stringify(val)}`)
        .join(', ');
      toast?.error(fieldErrors || err.message || 'Erreur lors de l\'enregistrement du produit');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Delete ----

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await collection('products').delete(deleteTarget.id);
      toast?.success('Produit déplacé dans la corbeille');
      setDeleteTarget(null);
      if (modalOpen && editingProduct?.id === deleteTarget.id) {
        setModalOpen(false);
        setEditingProduct(null);
      }
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast?.error('Erreur lors de la suppression du produit');
    } finally {
      setDeleting(false);
    }
  };

  const fetchTrash = async () => {
    setTrashLoading(true);
    try {
      const { api } = await import('../lib/api');
      const res = await api.get('/products/trash');
      setTrashedProducts(res.data?.data || []);
    } catch (err) {
      toast?.error('Erreur lors du chargement de la corbeille');
    } finally {
      setTrashLoading(false);
    }
  };

  const handleRestore = async (productId) => {
    setRestoring(productId);
    try {
      const { api } = await import('../lib/api');
      await api.patch(`/products/${productId}/restore`);
      toast?.success('Produit restauré avec succès');
      setTrashedProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
      fetchProducts();
    } catch (err) {
      toast?.error('Erreur lors de la restauration');
    } finally {
      setRestoring(null);
    }
  };

  const openTrash = () => {
    setTrashOpen(true);
    fetchTrash();
  };

  // ---- Table columns ----

  const columns = [
    {
      key: 'images',
      label: 'Image',
      render: (val, row) => {
        const images = val || [];
        const src = images.length > 0 ? getImageUrl(row, images[0]) : null;
        return src ? (
          <img
            src={src}
            alt={row.name_fr}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
            <ImageIcon size={16} />
          </div>
        );
      },
    },
    { key: 'name_fr', label: 'Nom' },
    {
      key: 'category',
      label: 'Catégorie',
      render: (val) => (
        <span className="text-sm text-neutral-600">
          {categoryLabels[val] || val}
        </span>
      ),
    },
    {
      key: 'price_dzd',
      label: 'Prix',
      render: (val) => (
        <span className="font-medium text-neutral-900">
          {formatDZD(val)}
        </span>
      ),
    },
    { key: 'stock', label: 'Stock' },
    {
      key: 'active',
      label: 'Actif',
      render: (val) => (
        <Badge color={val ? 'success' : 'error'}>
          {val ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'featured',
      label: 'Mis en avant',
      render: (val) =>
        val ? (
          <Star size={16} className="text-brand-gold" fill="currentColor" />
        ) : (
          <span className="text-neutral-300">—</span>
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
            Produits
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {totalCount} produit{totalCount > 1 ? 's' : ''}
          </p>
          {isAdmin && (
            <Link to="/admin/trash" className="text-sm text-neutral-500 hover:text-brand-navy flex items-center gap-1 mt-1">
              <Trash2 size={14} /> Corbeille
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={openTrash}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Trash2 size={16} className="text-neutral-400" />
              Corbeille
            </button>
          )}
          <Button variant="primary" size="md" onClick={openCreateForm}>
            <Plus size={18} />
            Ajouter un produit
          </Button>
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
              placeholder="Rechercher par nom ou slug…"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 py-2.5 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
          </div>

          {/* Category filter */}
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="">Toutes les catégories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Active only toggle */}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-700 transition-all duration-200 hover:border-neutral-400">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
            />
            Actifs uniquement
          </label>
        </div>
      </div>

      {/* Bulk action bar — appears when ≥1 row is selected */}
      {isAdmin && selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-brand-navy/20 bg-brand-navy/5 px-4 py-3">
          <span className="text-sm font-semibold text-brand-navy">
            {selectedIds.length} produit{selectedIds.length > 1 ? 's sélectionnés' : ' sélectionné'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-error px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 size={15} />
              Déplacer dans la corbeille
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={products}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyMessage="Aucun produit trouvé."
            onRowClick={handleRowClick}
            selectable={isAdmin}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
          />
        )}
      </div>

      {/* Product form modal (create / edit) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
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

            {/* Name */}
            <div>
              <label
                htmlFor="name_fr"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Nom (français) <span className="text-error">*</span>
              </label>
              <input
                id="name_fr"
                {...register('name_fr', { required: 'Le nom est requis' })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              {errors.name_fr && (
                <p className="mt-1 text-xs text-error">
                  {errors.name_fr.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="description_fr"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Description
              </label>
              <textarea
                id="description_fr"
                {...register('description_fr')}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price_dzd"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Prix (DZD) <span className="text-error">*</span>
              </label>
              <input
                id="price_dzd"
                type="number"
                min="0"
                step="1"
                {...register('price_dzd', {
                  required: 'Le prix est requis',
                  min: { value: 0, message: 'Le prix ne peut pas être négatif' },
                })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
              {errors.price_dzd && (
                <p className="mt-1 text-xs text-error">
                  {errors.price_dzd.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Catégorie <span className="text-error">*</span>
              </label>
              <select
                id="category"
                {...register('category', { required: 'La catégorie est requise' })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              >
                <option value="">Sélectionner…</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-error">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                {...register('stock')}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>

            {/* SKU */}
            <div>
              <label
                htmlFor="sku"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                SKU
              </label>
              <input
                id="sku"
                {...register('sku')}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>

            {/* Brand */}
            <div>
              <label
                htmlFor="brand"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700"
              >
                Marque
              </label>
              <input
                id="brand"
                {...register('brand')}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>
          </div>

          {/* Checkboxes row */}
          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                {...register('active')}
                className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
              />
              Actif
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
              />
              Mis en avant
            </label>
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-700">
              Images produit (max 5)
            </label>

            {/* Existing image thumbnails */}
            {editingProduct &&
              (editingProduct.images || []).length > 0 && (
                <div className="mb-3 flex flex-wrap gap-3">
                  {(editingProduct.images || []).map((imageName) => {
                    const isRemoved = removedImageNames.includes(imageName);
                    const src = getImageUrl(editingProduct, imageName);
                    return (
                      <div
                        key={imageName}
                        className={`group relative h-20 w-20 overflow-hidden rounded-xl border-2 ${
                          isRemoved
                            ? 'border-error opacity-50'
                            : 'border-neutral-200'
                        }`}
                      >
                        {src ? (
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            isRemoved
                              ? setRemovedImageNames((prev) =>
                                  prev.filter((n) => n !== imageName)
                                )
                              : removeExistingImage(imageName)
                          }
                          className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white transition-all duration-150 ${
                            isRemoved
                              ? 'bg-brand-teal'
                              : 'bg-neutral-900/60 opacity-0 group-hover:opacity-100'
                          }`}
                          title={
                            isRemoved
                              ? 'Annuler la suppression'
                              : 'Supprimer'
                          }
                        >
                          {isRemoved ? (
                            <X size={12} />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                        {isRemoved && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-error/80 px-1 py-0.5 text-[10px] text-white">
                            Supprimée
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            {/* New file previews */}
            {newImageFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {newImageFiles.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="group relative h-20 w-20 overflow-hidden rounded-xl border-2 border-brand-teal"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/60 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      title="Supprimer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File input */}
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-white">
                <Plus size={16} />
                {newImageFiles.length > 0
                  ? 'Ajouter d\'autres images'
                  : 'Sélectionner des images'}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-neutral-500">
                {editingProduct
                  ? Math.max(
                      0,
                      5 -
                        ((editingProduct.images || []).filter(
                          (n) => !removedImageNames.includes(n)
                        ).length +
                          newImageFiles.length)
                    )
                  : 5 - newImageFiles.length}{' '}
                place(s) restante(s)
              </span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-5">
            {/* Delete button (edit mode only) */}
            {editingProduct && (
              <PermissionGate action="delete">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-error hover:text-error"
                  onClick={() => setDeleteTarget(editingProduct)}
                >
                  <Trash2 size={16} />
                  Supprimer
                </Button>
              </PermissionGate>
            )}
            <div className="ml-auto flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setModalOpen(false);
                  setEditingProduct(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary" size="md" loading={submitting}>
                {editingProduct ? 'Enregistrer' : 'Ajouter le produit'}
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
            Êtes-vous sûr de vouloir déplacer le produit{' '}
            <span className="font-semibold text-neutral-900">
              {deleteTarget?.name_fr}
            </span>{' '}
            dans la corbeille ? Vous pourrez le restaurer ultérieurement.
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

      {/* Bulk delete confirmation modal */}
      <Modal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Confirmer la suppression groupée"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-700">
            Êtes-vous sûr de vouloir déplacer{' '}
            <span className="font-semibold text-neutral-900">
              {selectedIds.length} produit{selectedIds.length > 1 ? 's' : ''}
            </span>{' '}
            dans la corbeille ? Vous pourrez les restaurer ultérieurement.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setBulkDeleteOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="bg-error text-white hover:bg-red-700"
              onClick={confirmBulkDelete}
              loading={bulkDeleting}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trash Modal */}
      {trashOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-neutral-200 shadow-xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-display text-xl font-bold text-neutral-950 flex items-center gap-2">
                <Trash2 size={20} className="text-neutral-400" />
                Corbeille — Produits supprimés
              </h2>
              <button
                onClick={() => setTrashOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {trashLoading ? (
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
              ) : trashedProducts.length === 0 ? (
                <p className="text-center text-sm text-neutral-400 py-12">La corbeille est vide.</p>
              ) : (
                <div className="space-y-3">
                  {trashedProducts.map((p) => {
                    const pid = p._id || p.id;
                    return (
                      <div key={pid} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">{p.name_fr}</p>
                          <p className="text-xs text-neutral-400">
                            Supprimé le {new Date(p.deletedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRestore(pid)}
                          disabled={restoring === pid}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-navyDark disabled:opacity-50 transition-colors"
                        >
                          {restoring === pid ? <Spinner size="xs" /> : <RotateCcw size={13} />}
                          Restaurer
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
