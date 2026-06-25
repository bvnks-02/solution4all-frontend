import { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Mail, BarChart3, Settings, LogOut, Menu, X, ChevronRight, ShoppingCart, Package, Sliders, Trash2, UserCircle } from 'lucide-react';
import { useAdmin } from './AdminContext';
import AdminDashboard from './AdminDashboard';
import AdminSubmissions from './AdminSubmissions';
import AdminAnalytics from './AdminAnalytics';
import AdminServices from './AdminServices';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminSettings from './AdminSettings';
import AdminTrash from './AdminTrash';
import ToastContainer from '../components/ui/ToastContainer';

export default function AdminLayout() {
  const { admin, logout, isAdmin } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
    { to: '/admin/submissions', icon: Mail, label: 'Messages' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Commandes' },
    { to: '/admin/products', icon: Package, label: 'Produits' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Statistiques' },
    { to: '/admin/services', icon: Sliders, label: 'Services' },
    ...(isAdmin ? [{ to: '/admin/trash', icon: Trash2, label: 'Corbeille' }] : []),
    { to: '/admin/settings', icon: UserCircle, label: 'Paramètres' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-navyDark text-white transform transition-transform duration-250 ease-spring lg:translate-x-0 lg:static lg:inset-auto print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#1C3F7A" />
              <path d="M8 16L14 10L14 14L24 14L24 18L14 18L14 22L8 16Z" fill="#F5A800" />
            </svg>
            <span className="font-display text-lg font-bold">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-brand-gold/20 text-brand-gold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm lg:hidden print:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen print:min-h-0 print:bg-white">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 print:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-neutral-500">
            <span>Administration</span>
            <ChevronRight size={14} />
            <span className="text-neutral-900 font-medium">
              {navItems.find((n) => {
                const itemPath = n.to.replace('/admin', '') || '/';
                const currentPath = location.pathname.replace('/admin', '') || '/';
                return n.end ? currentPath === '/' : currentPath.startsWith(itemPath);
              })?.label || 'Tableau de bord'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold text-neutral-900 flex items-center justify-center text-sm font-bold font-display">
              {admin?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:block text-sm text-neutral-700 font-medium">{admin?.email || 'Admin'}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 print:p-0">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="trash" element={<AdminTrash />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
