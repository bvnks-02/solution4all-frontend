import { ShieldCheck, Clock, Settings } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';

const features = [
  {
    icon: ShieldCheck,
    title: 'Fiabilité',
    description: 'Nous tenons nos engagements et nos délais, toujours.',
  },
  {
    icon: Clock,
    title: 'Support réactif',
    description: "Délais d'intervention garantis selon votre contrat. Pas de ticket perdu.",
  },
  {
    icon: Settings,
    title: 'Solutions sur mesure',
    description: "Nous adaptons chaque intervention aux besoins spécifiques de votre infrastructure.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Pourquoi nous"
          title="Pourquoi choisir solution4all ?"
          subtitle="Des professionnels dédiés à votre réussite technologique"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image column */}
          <div className="relative order-2 lg:order-1 reveal-item" data-delay="1">
            {/* Decorative gold accent block behind image */}
            <div
              className="absolute -bottom-5 -right-5 w-full h-full bg-brand-gold rounded-2xl"
              aria-hidden="true"
            />
            <img
              src="/images/server.jpg"
              alt="Infrastructure serveur professionnelle"
              className="relative w-full h-auto rounded-2xl shadow-xl object-cover"
              loading="lazy"
            />
          </div>

          {/* Feature cards column */}
          <div className="order-1 lg:order-2 grid grid-cols-1 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-5 reveal-item" data-delay={String(i + 2)}>
                  <div className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-navy/10 text-brand-navy">
                    <Icon size={26} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-neutral-900">{feature.title}</h3>
                    <p className="mt-1 text-neutral-700 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
