import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/services', label: 'Services' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar({ onCartOpen }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { count: cartCount } = useCart();
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Mount entrance animation
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setMounted(true);
    } else {
      // Small delay to trigger the navbar-drop animation
      requestAnimationFrame(() => setMounted(true));
    }
  }, []);

  // Scroll sentinel observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Focus trap & Esc key for drawer
  useEffect(() => {
    if (!drawerOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeDrawer();
      }
      // Focus trap
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setClosing(false);
      // Restore focus to hamburger
      if (hamburgerRef.current) hamburgerRef.current.focus();
    }, 300);
  }, []);

  const openDrawer = useCallback(() => {
    setClosing(false);
    setDrawerOpen(true);
  }, []);

  // Determine navbar styles
  const headerClasses = isScrolled
    ? 'fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md shadow-card-hover transition-all duration-350'
    : 'fixed top-0 inset-x-0 z-50 bg-brand-navy transition-all duration-350';

  const logoScale = isScrolled ? 'scale-95' : 'scale-100';

  return (
    <>
      {/* Scroll sentinel */}
      <div ref={sentinelRef} className="absolute top-20 left-0 w-full h-px pointer-events-none" />

      <header
        className={`${headerClasses} ${mounted ? 'animate-navbar-drop' : 'opacity-0'}`}
        id="site-header"
        role="navigation"
        aria-label="Navigation principale"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className={`flex items-center gap-2 transition-transform duration-350 ease-spring ${logoScale}`}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#1C3F7A" />
              <path d="M8 16L14 10L14 14L24 14L24 18L14 18L14 22L8 16Z" fill="#F5A800" />
            </svg>
<span className={`font-display text-xl font-bold transition-colors duration-150 ${isScrolled ? 'text-brand-navy' : 'text-white'}`}>
                solution4all
              </span>
              <span className={`hidden sm:inline text-xs font-medium tracking-wide transition-colors duration-150 ${isScrolled ? 'text-neutral-500' : 'text-white/60'}`}>
                votre clinique informatique
              </span>
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => {
                  const base = isScrolled
                    ? 'text-neutral-700 text-sm font-medium transition-colors duration-150'
                    : 'text-white/90 text-sm font-medium transition-colors duration-150';
                  const active = isActive
                    ? isScrolled
                      ? 'text-brand-navy font-semibold nav-link-underline nav-link-underline-active'
                      : 'text-brand-gold font-semibold'
                    : '';
                  return `${base} ${active} nav-link-underline`;
                }}
                style={{ animationDelay: mounted ? `${i * 40}ms` : '0ms' }}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={onCartOpen}
              className={`relative p-2 transition-colors duration-150 ${isScrolled ? 'text-neutral-700 hover:text-brand-navy' : 'text-white/90 hover:text-brand-gold'}`}
              aria-label="Panier"
            >
              <ShoppingCart size={20} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-gold text-neutral-900 text-xs font-bold flex items-center justify-center animate-scale-in">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
            <Link
              to="/admin"
              className={`inline-flex items-center justify-center font-display font-semibold rounded-lg transition-[color,background-color,transform,box-shadow,opacity,border-color] duration-250 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 px-3.5 py-1.5 text-sm select-none cursor-pointer border-2 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98] active:translate-y-0 ${
                isScrolled
                  ? 'border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white focus-visible:ring-brand-navy'
                  : 'border-white/80 text-white hover:bg-white hover:text-brand-navy focus-visible:ring-white'
              }`}
            >
              Accès Admin
            </Link>
            <Button
              variant="primary"
              size="sm"
              href="/contact?dept=commercial"
              className="transition-[transform,box-shadow] duration-250 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98]"
            >
              Demander un devis
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:outline-none transition-colors duration-150"
            onClick={drawerOpen ? closeDrawer : openDrawer}
            aria-label={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={drawerOpen}
          >
            <span className="relative w-6 h-6 flex items-center justify-center">
              <Menu
                size={24}
                className={`absolute transition-all duration-200 ${drawerOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'} ${isScrolled ? 'text-brand-navy' : 'text-white'}`}
              />
              <X
                size={24}
                className={`absolute transition-all duration-200 ${drawerOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'} ${isScrolled ? 'text-brand-navy' : 'text-white'}`}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm animate-fade-in"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            ref={drawerRef}
            className={`fixed top-0 right-0 h-full w-80 z-50 bg-white shadow-modal ${closing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl font-bold text-brand-navy">solution4all</span>
                <span className="text-xs font-medium tracking-wide text-neutral-500">votre clinique informatique</span>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:outline-none"
                  aria-label="Fermer le menu"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `text-base font-medium px-3 py-2 rounded-lg transition-colors duration-150 animate-fade-up ${
                        isActive
                          ? 'text-brand-navy bg-brand-navy/5 font-semibold'
                          : 'text-neutral-700 hover:text-brand-navy hover:bg-neutral-50'
                      }`
                    }
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={closeDrawer}
                  >
                    {link.label}
                  </NavLink>
                ))}
                <button
                  onClick={() => { closeDrawer(); onCartOpen(); }}
                  className="flex items-center gap-3 text-base font-medium px-3 py-2 rounded-lg text-neutral-700 hover:text-brand-navy hover:bg-neutral-50 transition-colors duration-150 w-full"
                >
                  <ShoppingCart size={18} strokeWidth={1.75} />
                  Panier
                  {cartCount > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-brand-gold text-neutral-900 text-xs font-bold flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
                <div className="mt-4 flex flex-col gap-3 animate-fade-up" style={{ animationDelay: `${navLinks.length * 60}ms` }}>
                  <Button variant="primary" size="md" href="/contact?dept=commercial" onClick={closeDrawer} className="w-full">
                    Demander un devis
                  </Button>
                  <Button variant="secondary" size="md" href="/admin" onClick={closeDrawer} className="w-full">
                    Accès Admin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
