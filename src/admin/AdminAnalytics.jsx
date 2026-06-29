import { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { collection } from '../lib/api';
import { useAdmin } from './AdminContext';
import { formatDateTime } from '../lib/format';
import { useToast } from '../components/ui/ToastContainer';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import ExportPDFButton from '../components/ui/ExportPDFButton';

const ITEMS_PER_PAGE = 50;

// Simple debounce hook
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const eventTypeLabels = {
  page_view: 'Page vue',
  cta_click: 'Clic CTA',
  form_submit: 'Formulaire envoyé',
  form_success: 'Formulaire réussi',
  form_error: 'Erreur formulaire',
  service_view: 'Service consulté',
};

const ALL_EVENT_TYPES = Object.keys(eventTypeLabels);

const eventTypeBadgeColors = {
  page_view: 'navy',
  cta_click: 'gold',
  form_submit: 'blue',
  form_success: 'success',
  form_error: 'error',
  service_view: 'teal',
};

const deviceTypeLabels = {
  mobile: 'Mobile',
  tablet: 'Tablette',
  desktop: 'Desktop',
};

const dateRangeOptions = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7days', label: '7 jours' },
  { value: '30days', label: '30 jours' },
  { value: 'all', label: 'Tout' },
];

function getDateRangeFilter(range) {
  if (range === 'all') return '';
  const now = new Date();
  if (range === 'today') {
    const s = now.toISOString().slice(0, 10);
    return `created >= "${s} 00:00:00"`;
  }
  const days = range === '7days' ? 7 : 30;
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  const s = d.toISOString().slice(0, 10);
  return `created >= "${s} 00:00:00"`;
}

const statCardAccents = {
  navy: 'border-t-brand-navy',
  gold: 'border-t-brand-gold',
  teal: 'border-t-brand-teal',
  indigo: 'border-t-indigo-500',
};

export default function AdminAnalytics() {
  const { admin } = useAdmin();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalAllTime: 0,
    totalToday: 0,
    totalWeek: 0,
    topEventType: null,
    topEventTypeCount: 0,
  });

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const abortRef = useRef(null);

  // ---- Data fetching ----

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const filters = [];
      if (eventTypeFilter) {
        filters.push(`event_type = "${eventTypeFilter}"`);
      }
      if (deviceTypeFilter) {
        filters.push(`device_type = "${deviceTypeFilter}"`);
      }
      const dateF = getDateRangeFilter(dateRange);
      if (dateF) {
        filters.push(dateF);
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim();
        filters.push(`(page_path ~ "${q}" || event_label ~ "${q}")`);
      }
      const filter = filters.join(' && ');

      // Top event type is computed over the full filtered dataset (not just the
      // current page) by reading totalItems from a perPage=1 count per type.
      // All requests run in one parallel batch and share the abort signal.
      const typeCountFilter = (type) => {
        const typeCond = `event_type = "${type}"`;
        return filter ? `${filter} && ${typeCond}` : typeCond;
      };

      const [listResult, totalAllResult, todayResult, weekResult, ...typeResults] =
        await Promise.all([
          collection('analytics_events').getList(page, ITEMS_PER_PAGE, {
            sort: '-created',
            filter: filter || undefined,
            signal: controller.signal,
          }),
          collection('analytics_events').getList(1, 1, {
            signal: controller.signal,
          }),
          collection('analytics_events').getList(1, 1, {
            filter: getDateRangeFilter('today'),
            signal: controller.signal,
          }),
          collection('analytics_events').getList(1, 1, {
            filter: getDateRangeFilter('7days'),
            signal: controller.signal,
          }),
          ...ALL_EVENT_TYPES.map((type) =>
            collection('analytics_events').getList(1, 1, {
              filter: typeCountFilter(type),
              signal: controller.signal,
            })
          ),
        ]);

      if (controller.signal.aborted) return;

      setEvents(listResult.items);
      setTotalCount(listResult.totalItems);
      setTotalPages(listResult.totalPages);

      let topType = null;
      let topCount = 0;
      typeResults.forEach((result, i) => {
        if (result.totalItems > topCount) {
          topCount = result.totalItems;
          topType = ALL_EVENT_TYPES[i];
        }
      });

      setStats({
        totalAllTime: totalAllResult.totalItems,
        totalToday: todayResult.totalItems,
        totalWeek: weekResult.totalItems,
        topEventType: topType,
        topEventTypeCount: topCount,
      });
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('Failed to fetch analytics:', err);
      toast?.error('Erreur lors du chargement des statistiques');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [page, eventTypeFilter, deviceTypeFilter, dateRange, debouncedSearch]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [eventTypeFilter, deviceTypeFilter, dateRange, debouncedSearch]);

  // ---- Table columns ----

  const columns = [
    {
      key: 'created',
      label: 'Date',
      render: (val) => (
        <span className="whitespace-nowrap text-sm text-neutral-600">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'event_type',
      label: 'Événement',
      render: (val) => (
        <Badge color={eventTypeBadgeColors[val] || 'neutral'}>
          {eventTypeLabels[val] || val}
        </Badge>
      ),
    },
    { key: 'page_path', label: 'Page' },
    {
      key: 'event_label',
      label: 'Libellé',
      render: (val) =>
        val ? (
          <span className="text-sm text-neutral-700">{val}</span>
        ) : (
          <span className="text-sm text-neutral-300">—</span>
        ),
    },
    {
      key: 'device_type',
      label: 'Appareil',
      render: (val) =>
        val ? (
          <span className="text-sm text-neutral-600">
            {deviceTypeLabels[val] || val}
          </span>
        ) : (
          <span className="text-sm text-neutral-300">—</span>
        ),
    },
    {
      key: 'session_id',
      label: 'Session',
      render: (val) =>
        val ? (
          <span className="font-mono text-xs text-neutral-400">
            {val.slice(0, 8)}…
          </span>
        ) : (
          <span className="text-sm text-neutral-300">—</span>
        ),
    },
  ];

  // ---- Stats cards ----

  const statCards = [
    {
      label: 'Total des événements',
      value: stats.totalAllTime,
      accent: 'navy',
    },
    {
      label: "Aujourd'hui",
      value: stats.totalToday,
      accent: 'gold',
    },
    {
      label: 'Cette semaine',
      value: stats.totalWeek,
      accent: 'teal',
    },
    {
      label: 'Événement principal',
      value: stats.topEventType
        ? eventTypeLabels[stats.topEventType] || stats.topEventType
        : '—',
      sub: stats.topEventType
        ? `${stats.topEventTypeCount.toLocaleString('fr-FR')} occurrence${stats.topEventTypeCount > 1 ? 's' : ''}`
        : null,
      accent: 'indigo',
    },
  ];

  // ---- Render ----

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            Statistiques
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Analyse du trafic et des interactions — {totalCount} événement{totalCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-navyDark transition-colors duration-150 print:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter en PDF
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl border border-neutral-200/60 border-t-4 bg-white p-5 shadow-card ${
              statCardAccents[card.accent] || 'border-t-neutral-200'
            }`}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              {card.label}
            </p>
            <p className="font-display text-2xl font-bold text-neutral-900">
              {loading ? (
                <span className="inline-block h-7 w-20 animate-pulse rounded bg-neutral-200" />
              ) : (
                card.value
              )}
            </p>
            {card.sub && (
              <p className="mt-1 text-xs text-neutral-400">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-xl border border-neutral-200/60 bg-white p-4 shadow-card print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Search */}
          <div className="relative min-w-[180px] flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par page ou libellé…"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 py-2.5 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
          </div>

          {/* Event type filter */}
          <div className="sm:w-44">
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="">Tous les types</option>
              {Object.entries(eventTypeLabels).map(([v, lbl]) => (
                <option key={v} value={v}>
                  {lbl}
                </option>
              ))}
            </select>
          </div>

          {/* Device type filter */}
          <div className="sm:w-36">
            <select
              value={deviceTypeFilter}
              onChange={(e) => setDeviceTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 transition-all duration-200 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="">Tous appareils</option>
              {Object.entries(deviceTypeLabels).map(([v, lbl]) => (
                <option key={v} value={v}>
                  {lbl}
                </option>
              ))}
            </select>
          </div>

          {/* Date range quick buttons */}
          <div className="flex gap-1">
            {dateRangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                  dateRange === opt.value
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <ExportPDFButton reportType="analytics" dateRange={dateRange} />
        </div>
      </div>

      {/* Events table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={events}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyMessage="Aucun événement trouvé."
          />
        )}
      </div>
    </div>
  );
}
