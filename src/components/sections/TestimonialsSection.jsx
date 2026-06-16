import SectionHeading from '../ui/SectionHeading';

const testimonials = [
  {
    name: 'Karim B.',
    company: 'TechPro SARL',
    quote: 'Une équipe réactive et professionnelle. Je recommande vivement solution4all.',
    initials: 'KB',
  },
  {
    name: 'Amina M.',
    company: 'DataNet Services',
    quote: 'Grâce à leur contrat de support, nos pannes sont résolues en moins de 4 heures.',
    initials: 'AM',
  },
  {
    name: 'Youcef D.',
    company: 'Solutions Plus',
    quote: 'Un partenaire fiable pour toute notre infrastructure informatique.',
    initials: 'YD',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-neutral-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Témoignages"
          title="Ce que disent nos clients"
          subtitle="Des entreprises algériennes nous font confiance"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <div key={t.initials} className="bg-white rounded-xl shadow-card border border-neutral-200/60 p-6 md:p-8 reveal-item" data-delay={String(i + 1)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-gold text-neutral-900 flex items-center justify-center text-sm font-bold font-display">
                  {t.initials}
                </div>
                <div>
                  <p className="font-display font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-sm text-neutral-500">{t.company}</p>
                </div>
              </div>
              <p className="text-neutral-700 italic leading-relaxed">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
