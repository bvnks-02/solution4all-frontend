import { useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import Button from '../ui/Button';
import { trackEvent } from '../../lib/analytics';

export default function HeroSection() {
  const handleCTA = (label) => {
    trackEvent('cta_click', '/', label);
  };

  const illustrationRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    function handleScroll() {
      if (illustrationRef.current) {
        const scrollY = window.scrollY;
        illustrationRef.current.style.transform = `translateY(${scrollY * 0.05}px)`;
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="bg-brand-navy relative overflow-hidden">
      {/* Decorative SVG arcs */}
      <svg aria-hidden="true" focusable="false" className="absolute top-0 right-0 -z-10 opacity-10 w-96 h-96" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" stroke="#F5A800" strokeWidth="20" strokeDasharray="250 80" />
        <circle cx="100" cy="100" r="48" stroke="#FFFFFF" strokeWidth="10" opacity="0.5" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
              Votre clinique informatique
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
              Des solutions informatiques fiables pour votre entreprise
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
              solution4all accompagne les entreprises algériennes dans leur transformation numérique — maintenance, réseaux, logiciels et support sur mesure.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Button
                variant="primary"
                size="lg"
                href="/contact?dept=commercial"
                onClick={() => handleCTA('Demander un devis - Hero')}
              >
                Demander un devis
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="/services"
                onClick={() => handleCTA('Découvrir nos services - Hero')}
                className="border-white text-white hover:bg-white hover:text-brand-navy"
              >
                Découvrir nos services
              </Button>
            </div>
            {/* Download offer PDF */}
            <div className="mt-5 animate-fade-up" style={{ animationDelay: '350ms' }}>
              <a
                href="/offre-de-service.pdf"
                download
                onClick={() => handleCTA('Télécharger offre de service - Hero')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold rounded-md transition-colors duration-250 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Télécharger notre offre de service (PDF)
              </a>
            </div>
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70 animate-fade-up" style={{ animationDelay: '400ms' }}>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Intervention rapide
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Équipe certifiée
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Support 24/7
              </span>
            </div>
          </div>

          {/* Illustration column */}
          <div ref={illustrationRef} className="hidden lg:flex justify-center animate-fade-in transition-transform duration-250" style={{ animationDelay: '450ms' }}>
            <div className="hero-glow relative">
              <div className="shimmer-overlay" aria-hidden="true" />
              <img
                src="/images/s4a.png"
                alt="solution4all — solutions informatiques pour entreprises"
                className="relative w-full max-w-md h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
