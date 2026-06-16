import { services } from '../../data/services';
import ServiceCard from './ServiceCard';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';

export default function ServicesOverview() {
  return (
    <section className="bg-neutral-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Services"
          title="Nos services"
          subtitle="Une gamme complète de solutions informatiques pour les entreprises"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, i) => (
            <div key={service.slug} className="reveal-item" data-delay={String(i + 1)}>
              <ServiceCard service={service} compact />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="primary" href="/services">
            Voir tous nos services
          </Button>
        </div>
      </div>
    </section>
  );
}