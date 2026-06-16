import { NavLink } from 'react-router-dom';
import { services } from '../../data/services';

const footerServices = services.map((s) => ({ slug: s.slug, title: s.title_fr }));
const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/services', label: 'Services' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
  { to: '/boutique', label: 'Boutique' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navyDark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#1C3F7A" />
                <path d="M8 16L14 10L14 14L24 14L24 18L14 18L14 22L8 16Z" fill="#F5A800" />
              </svg>
              <span className="font-display text-xl font-bold text-white">solution4all</span>
            </div>
            <p className="text-brand-gold text-sm font-semibold tracking-wide mt-1">
              Votre clinique informatique
            </p>
            <p className="text-white/70 text-sm leading-relaxed mt-2">
              Solutions informatiques pour les entreprises algériennes
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Services</h3>
            <ul className="space-y-2">
              {footerServices.map((s) => (
                <li key={s.slug}>
                  <NavLink
                    to={`/services#${s.slug}`}
                    className="text-white/70 text-sm hover:text-brand-gold transition-colors duration-200"
                  >
                    {s.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="text-white/70 text-sm hover:text-brand-gold transition-colors duration-200"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="mailto:contact@solution4all.dz" className="hover:text-brand-gold transition-colors duration-200">
                  contact@solution4all.dz
                </a>
              </li>
              <li>
                <a href="mailto:commercial@solution4all.dz" className="hover:text-brand-gold transition-colors duration-200">
                  commercial@solution4all.dz
                </a>
              </li>
              <li>
                <a href="mailto:technique@solution4all.dz" className="hover:text-brand-gold transition-colors duration-200">
                  technique@solution4all.dz
                </a>
              </li>
              <li>
                <a href="tel:+213665020020" className="hover:text-brand-gold transition-colors duration-200">
                  0665 020 020
                </a>
              </li>
              <li>
                <a href="tel:+213770336007" className="hover:text-brand-gold transition-colors duration-200">
                  0770 336 007
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-white/40 text-xs">
          &copy; 2026 solution4all. Tous droits réservés. &middot; <a href="mailto:software.contact@solution4all.dz" className="hover:text-brand-gold transition-colors">software.contact@solution4all.dz</a>
        </div>
      </div>
    </footer>
  );
}
