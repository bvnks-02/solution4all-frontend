import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://apisol4all.acsociety.club/api/v1';

// Transform MongoDB response fields to frontend-compatible format
function transformRecord(record) {
  if (!record || typeof record !== 'object') return record;
  if (Array.isArray(record)) return record.map(transformRecord);

  const transformed = { ...record };
  // Map _id → id
  if (transformed._id) {
    transformed.id = String(transformed._id);
    delete transformed._id;
  }
  // Map createdAt → created
  if (transformed.createdAt) {
    transformed.created = transformed.createdAt;
    delete transformed.createdAt;
  }
  // Map updatedAt → updated
  if (transformed.updatedAt) {
    transformed.updated = transformed.updatedAt;
    delete transformed.updatedAt;
  }
  return transformed;
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - transform MongoDB fields and handle auth errors
api.interceptors.response.use(
  (response) => {
    // Transform MongoDB fields to frontend-compatible format
    if (response.data?.data) {
      if (Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map(transformRecord);
      } else if (typeof response.data.data === 'object') {
        response.data.data = transformRecord(response.data.data);
      }
    }
    return response;
  },
  (error) => {
    // Network errors (backend unreachable) — reject silently so callers
    // can handle them without console noise. The browser still logs the
    // failed request in DevTools, but our code won't add to it.
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 401/403 = stale/invalid token
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_record');
      // Small delay so the current request finishes before reload
      setTimeout(() => window.location.reload(), 500);
    }
    return Promise.reject(error);
  }
);

// Auth helpers
export const auth = {
  async signIn(email, password) {
    const response = await api.post('/auth/signin', { email, password });
    const { token, record } = response.data.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_record', JSON.stringify(record));
    return { token, record };
  },

  async refresh() {
    const response = await api.post('/auth/refresh');
    const { token, record } = response.data.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_record', JSON.stringify(record));
    return { token, record };
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  getRecord() {
    const record = localStorage.getItem('auth_record');
    return record ? JSON.parse(record) : null;
  },

  isValid() {
    const token = this.getToken();
    const record = this.getRecord();
    return !!token && !!record;
  },

  clear() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_record');
  },

  onChange(callback) {
    // Listen for storage events (cross-tab) and custom events (same-tab)
    const handler = () => {
      callback(this.getToken(), this.getRecord());
    };
    window.addEventListener('storage', handler);
    window.addEventListener('auth-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('auth-change', handler);
    };
  },
};

// Collection-style API for Express backend
export const collection = (name) => {
  // Map collection names to Express API endpoints
  const endpointMap = {
    products: '/products',
    orders: '/orders',
    services: '/services',
    contact_submissions: '/contact-submissions',
    analytics_events: '/analytics-events',
  };

  const endpoint = endpointMap[name] || `/${name}`;

  // Parse a filter string into query params
  function parseFilterString(filterStr) {
    const params = {};
    const conditions = filterStr.split('&&').map(c => c.trim());
    for (const cond of conditions) {
      if (cond.startsWith('(')) continue; // OR conditions handled via search param

      const tildeMatch = cond.match(/(\w+)\s*~\s*['"]?([^'"]*)['"]?/);
      if (tildeMatch) {
        const [, field, value] = tildeMatch;
        const searchFields = ['name_fr', 'description_fr', 'title_fr', 'subject', 'full_name', 'email'];
        if (searchFields.includes(field)) {
          params.search = params.search ? `${params.search} ${value}` : value;
        }
        continue;
      }

      const gteMatch = cond.match(/(\w+)\s*>=\s*['"]?([^'"]*)['"]?/);
      if (gteMatch) {
        const [, field, value] = gteMatch;
        const map = { created: 'dateFrom', updated: 'dateFrom' };
        params[map[field] || field] = value;
        continue;
      }

      const lteMatch = cond.match(/(\w+)\s*<=\s*['"]?([^'"]*)['"]?/);
      if (lteMatch) {
        const [, field, value] = lteMatch;
        const map = { created: 'dateTo', updated: 'dateTo' };
        params[map[field] || field] = value;
        continue;
      }

      const eqMatch = cond.match(/(\w+)\s*=\s*['"]?([^'"]*)['"]?/);
      if (eqMatch) {
        const [, field, value] = eqMatch;
        if (value === 'true') params[field] = true;
        else if (value === 'false') params[field] = false;
        else params[field] = value;
        continue;
      }
    }
    return params;
  }

  // Apply filter (object or string) to params
  function applyFilter(params, filter) {
    if (!filter) return params;
    if (typeof filter === 'object' && !Array.isArray(filter)) {
      // Structured filter: { active: true, category: 'ordinateurs', search: 'laptop' }
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params[key] = value;
        }
      });
    } else if (typeof filter === 'string') {
      // Legacy filter string format
      Object.assign(params, parseFilterString(filter));
    }
    return params;
  }

  return {
    // Get list with pagination and filters
    async getList(page = 1, perPage = 30, options = {}) {
      const params = { page, perPage };
      if (options.sort) params.sort = options.sort;
      applyFilter(params, options.filter);

      const axiosConfig = {};
      if (options.signal) axiosConfig.signal = options.signal;

      const response = await api.get(endpoint, { params, ...axiosConfig });
      return {
        items: response.data.data,
        totalItems: response.data.meta?.totalItems || 0,
        page: response.data.meta?.page || page,
        perPage: response.data.meta?.perPage || perPage,
        totalPages: response.data.meta?.totalPages || 1,
      };
    },

    // Get full list (all records, no pagination)
    async getFullList(options = {}) {
      const params = { perPage: 500 };
      if (options.sort) params.sort = options.sort;
      applyFilter(params, options.filter);

      const axiosConfig = {};
      if (options.signal) axiosConfig.signal = options.signal;

      const response = await api.get(endpoint, { params, ...axiosConfig });
      return response.data.data;
    },

    // Get one record by ID
    async getOne(id) {
      const response = await api.get(`${endpoint}/${id}`);
      return response.data.data;
    },

    // Get first record matching a filter (used for slug lookups)
    async getFirstListItem(filter) {
      // Parse filter to extract slug or other field
      const params = {};
      const conditions = filter.split('&&').map(c => c.trim());
      for (const cond of conditions) {
        const match = cond.match(/(\w+)\s*[=~]?=\s*['"]?([^'"]*)['"]?/);
        if (match) {
          const [, field, value] = match;
          params[field] = value;
        }
      }

      // If looking for a slug, use the slug endpoint
      if (params.slug && name === 'products') {
        const response = await api.get(`${endpoint}/slug/${params.slug}`);
        return response.data.data;
      }

      // Otherwise, use list endpoint with filter
      const response = await api.get(endpoint, { params: { ...params, perPage: 1 } });
      const items = response.data.data;
      if (!items || items.length === 0) {
        throw new Error('Record not found');
      }
      return items[0];
    },

    // Create a record
    async create(data) {
      const response = await api.post(endpoint, data);
      return response.data.data;
    },

    // Update a record
    async update(id, data) {
      const response = await api.patch(`${endpoint}/${id}`, data);
      return response.data.data;
    },

    // Delete a record
    async delete(id) {
      await api.delete(`${endpoint}/${id}`);
    },
  };
};

// File upload helper (supports POST and PUT)
// Do NOT set Content-Type manually — axios auto-sets multipart/form-data
// with the correct boundary when given a FormData object.
export const uploadFile = async (url, formData, method = 'post') => {
  const token = localStorage.getItem('auth_token');
  const response = await axios({
    method,
    url: `${API_URL}${url}`,
    data: formData,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  return response.data.data;
};

export { api };
export default api;
export { API_URL };

// Generate a file URL for uploaded files served by the Express backend
// Express serves uploads/ at root path: /uploads/products/file.jpg
export function getFileURL(record, filename) {
  if (!filename || !record?.id) return null;
  const baseUrl = API_URL.replace('/api/v1', '');
  return `${baseUrl}/uploads/products/${filename}`;
}

// Auth store interface (localStorage-backed, for components that need reactive auth state)
export const authStore = {
  get isValid() {
    const token = localStorage.getItem('auth_token');
    const record = localStorage.getItem('auth_record');
    return !!token && !!record;
  },
  get record() {
    const record = localStorage.getItem('auth_record');
    return record ? JSON.parse(record) : null;
  },
  get token() {
    return localStorage.getItem('auth_token') || '';
  },
  clear() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_record');
    window.dispatchEvent(new Event('auth-change'));
  },
  onChange(callback) {
    const handler = () => {
      callback(this.token, this.record);
    };
    window.addEventListener('storage', handler);
    window.addEventListener('auth-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('auth-change', handler);
    };
  },
};
