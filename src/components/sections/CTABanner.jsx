import Button from '../ui/Button';

export default function CTABanner({
  heading = 'Prêt à optimiser votre infrastructure informatique ?',
  subtext = "Contactez-nous dès aujourd'hui pour un devis gratuit et sans engagement.",
  primaryLabel = 'Demander un devis',
  primaryHref = '/contact?dept=commercial',
  secondaryLabel = 'Nous contacter',
  secondaryHref = '/contact',
}) {
  return (
    <section className="bg-brand-navy py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-4">
          Prêt à commencer ?
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto leading-tight mb-6">
          {heading}
        </h2>
        <p className="text-lg text-white/70 mb-8">{subtext}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" href={primaryHref}>
            {primaryLabel}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href={secondaryHref}
            className="border-white text-white hover:bg-white hover:text-brand-navy"
          >
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
