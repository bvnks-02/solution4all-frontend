import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import SEOHead from '../components/ui/SEOHead';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Select from '../components/ui/Select';
import { collection, getFileURL } from '../lib/api';
import { formatDZD } from '../lib/format';
import { useScrollTop } from '../hooks/useScrollTop';

const PER_PAGE = 12;

const categoryLabels = {
  ordinateurs: 'Ordinateurs',
  imprimantes: 'Imprimantes',
  onduleurs: 'Onduleurs',
  serveurs: 'Serveurs',
  consommables: 'Consommables',
  logiciels: 'Logiciels',
  licences: 'Licences logicielles',
};

const categoryBadgeColors = {
  ordinateurs: 'blue',
  imprimantes: 'teal',
  onduleurs: 'gold',
  serveurs: 'purple',
  consommables: 'green',
  logiciels: 'indigo',
  licences: 'cyan',
};

const sortOptions = [
  { value: '-featured,name_fr', label: 'Par défaut' },
  { value: 'name_fr', label: 'Nom (A → Z)' },
  { value: '-name_fr', label: 'Nom (Z → A)' },
  { value: 'price_dzd', label: 'Prix (croissant)' },
  { value: '-price_dzd', label: 'Prix (décroissant)' },
];

export default function Boutique() {
  useScrollTop();

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Filter state derived from URL search params
  const activeCategory = searchParams.get('categorie') || '';
  const searchQuery = searchParams.get('recherche') || '';
  const sortValue = searchParams.get('tri') || '-featured,name_fr';

  // Local search input state for controlled input (syncs with URL)
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Keep page in URL for consistency
  const pageFromParams = parseInt(searchParams.get('page'), 10) || 1;

  // Sync page state with URL on mount and param changes
  useEffect(() => {
    setPage(pageFromParams);
  }, [pageFromParams]);

  // Sync search input with URL search params
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const updateFilters = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      // Reset to page 1 when any filter changes (unless explicitly changing page)
      if (!('page' in updates)) {
        next.delete('page');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Fetch products with AbortController for race-condition safety
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Structured filter — no string interpolation, no injection risk
        const filter = { active: true };
        if (activeCategory) filter.category = activeCategory;
        if (searchQuery) filter.search = searchQuery;

        const result = await collection('products').getList(page, PER_PAGE, {
          sort: sortValue,
          filter,
          signal: controller.signal,
        });

        // Clamp page if it exceeds totalPages (e.g. direct URL ?page=99)
        const totalPages = Math.max(1, Math.ceil(result.totalItems / PER_PAGE));
        if (page > totalPages) {
          updateFilters({ page: String(totalPages) });
          return; // stale fetch — the page change will trigger a new one
        }

        setProducts(result.items);
        setTotalItems(result.totalItems);
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError("Impossible de charger les produits. Veuillez réessayer.");
        setProducts([]);
        setTotalItems(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [page, activeCategory, searchQuery, sortValue, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  const handlePrevPage = () => {
    if (page > 1) {
      updateFilters({ page: String(page - 1) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      updateFilters({ page: String(page + 1) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (category) => {
    updateFilters({ categorie: category || '', recherche: searchQuery || '' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('recherche') || '';
    updateFilters({ recherche: q });
  };

  const handleSortChange = (e) => {
    updateFilters({ tri: e.target.value });
  };

  return (
    <>
      <SEOHead
        title="Boutique — Matériel informatique professionnel"
        description="Découvrez notre gamme complète de matériel informatique professionnel en Algérie : ordinateurs, imprimantes, onduleurs, serveurs, consommables et logiciels. Livraison rapide."
        path="/boutique"
      />

      {/* Hero Banner */}
      <section className="bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">
            Nos produits
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Matériel informatique professionnel
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl">
            Des équipements de qualité pour les entreprises algériennes — ordinateurs, serveurs,
            imprimantes et accessoires sélectionnés pour leur fiabilité.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
                !activeCategory
                  ? 'bg-brand-navy text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Tout
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
                  activeCategory === key
                    ? 'bg-brand-navy text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  name="recherche"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-100 pl-10 pr-4 py-2.5 text-neutral-900 text-sm font-sans transition-all duration-200 focus:outline-none focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/20 hover:border-neutral-400"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            </form>
            <div className="sm:w-56">
              <Select
                value={sortValue}
                onChange={handleSortChange}
                options={sortOptions}
                className=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-neutral-50 py-12 md:py-16 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" />
              <p className="mt-4 text-neutral-500 text-sm">Chargement des produits…</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-error font-semibold">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setRetryKey((k) => k + 1)}
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={48} className="text-neutral-300 mb-4" />
              <h3 className="font-display text-xl font-semibold text-neutral-700">
                Aucun produit trouvé
              </h3>
              <p className="mt-2 text-neutral-500 max-w-md">
                Essayez de modifier vos filtres ou de rechercher un autre terme.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-6"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <p className="text-sm text-neutral-500 mb-6">
                {totalItems} produit{totalItems > 1 ? 's' : ''} trouvé{totalItems > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const thumbUrl =
                    product.images && product.images.length > 0
                      ? getFileURL(product, product.images[0])
                      : null;

                  const badgeColor = categoryBadgeColors[product.category] || 'neutral';

                  return (
                    <Link
                      key={product.id}
                      to={`/boutique/${product.slug}`}
                      className="reveal-item group block"
                    >
                      <Card hoverable className="h-full flex flex-col p-0 overflow-hidden">
                        {/* Product Image */}
                        <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={product.name_fr}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                              <ShoppingBag size={48} />
                            </div>
                          )}
                          {/* Category Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge color={badgeColor}>
                              {categoryLabels[product.category] || product.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col flex-1 p-5">
                          <h3 className="font-display text-base font-semibold text-neutral-900 group-hover:text-brand-navy transition-colors duration-200">
                            {product.name_fr}
                          </h3>
                          <p className="mt-1 text-lg font-bold text-brand-navy">
                            {formatDZD(product.price_dzd)}
                          </p>
                          <div className="mt-auto pt-4">
                            <span className="inline-flex items-center text-sm font-medium text-brand-navy group-hover:underline underline-offset-4 transition-all duration-200">
                              Voir le produit
                              <ChevronRight size={16} className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-neutral-200">
                  <p className="text-sm text-neutral-500">
                    Page {page} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={page <= 1}
                    >
                      <ChevronLeft size={16} />
                      <span className="ml-1">Précédent</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page >= totalPages}
                    >
                      <span className="mr-1">Suivant</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}