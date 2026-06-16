import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import SEOHead from '../components/ui/SEOHead';
import Button from '../components/ui/Button';
import CTABanner from '../components/sections/CTABanner';
import { services } from '../data/services';
import { colorMap } from '../data/colorMap';

export default function Services() {
  return (
    <>
      <SEOHead
        title="Nos services informatiques"
        description="Découvrez nos services : maintenance, contrats de support, réseaux et sécurité, vente de matériel et logiciels professionnels en Algérie."
        path="/services"
      />

      {/* Page Hero */}
      <section className="bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-white/60 mb-4">
            <Link to="/" className="hover:text-brand-gold transition-colors duration-150">
              Accueil
            </Link>
            <span className="mx-2">›</span>
            <span className="text-white">Services</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">
            Nos prestations
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Nos services informatiques
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl">
            Des prestations adaptées aux besoins des entreprises algériennes
          </p>
        </div>
      </section>

      {/* Service Detail Sections */}
      {services.map((service, index) => {
        const FallbackIcon = LucideIcons.Settings;
        const Icon = LucideIcons[service.icon_name] || FallbackIcon;
        const colors = colorMap[service.color_class] || colorMap.blue;
        const isEven = index % 2 === 0;
        const features = service.features || [];
        const deptParam = service.department
          ? `?dept=${service.department}`
          : '';
        const hasImage = Boolean(service.image);

        return (
          <section
            key={service.slug || index}
            id={service.slug}
            className={`py-16 md:py-24 ${isEven ? 'bg-white' : 'bg-neutral-50'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`grid grid-cols-1 ${
                  hasImage ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-3xl'
                } gap-12 items-center`}
              >
                {/* Text side */}
                <div className={isEven && hasImage ? '' : hasImage ? 'lg:order-2' : ''}>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bg} ${colors.text}`}
                  >
                    <Icon size={32} />
                  </div>
                  <h2 className="mt-4 text-3xl font-bold text-neutral-900">
                    {service.title_fr}
                  </h2>
                  <p className="mt-4 text-lg text-neutral-700">
                    {service.description_fr}
                  </p>
                  {features.length > 0 && (
                    <ul className="mt-6 space-y-3">
                      {features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-neutral-700"
                        >
                          <span className="text-brand-navy mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      href={`/contact${deptParam}`}
                    >
                      Demander un devis
                    </Button>
                    <Button variant="secondary" href="/contact">
                      Nous contacter
                    </Button>
                  </div>
                </div>

                {/* Image side */}
                {hasImage && (
                  <div
                    className={`flex justify-center ${
                      isEven ? '' : 'lg:order-1'
                    }`}
                  >
                    <div className="relative w-full max-w-md">
                      <img
                        src={service.image}
                        alt={service.title_fr}
                        className="w-full h-auto rounded-2xl shadow-card"
                        loading="lazy"
                      />
                      {/* Decorative accent */}
                      <div
                        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl ${colors.bg} -z-10`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <CTABanner />
    </>
  );
}