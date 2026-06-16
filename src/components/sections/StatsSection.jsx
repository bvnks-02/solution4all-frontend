import { useCountUp } from '../../hooks/useCountUp';

const stats = [
  { value: 15, suffix: '+', label: "Années d'expérience", delay: 0 },
  { value: 200, suffix: '+', label: 'Clients accompagnés', delay: 100 },
  { value: 4, prefix: '<', suffix: 'h', label: "Délai d'intervention moyen", delay: 200 },
  { value: 98, suffix: '%', label: 'Satisfaction client', delay: 300 },
];

function StatItem({ value, prefix = '', suffix = '', label, delay = 0 }) {
  const ref = useCountUp(value, 1800);
  return (
    <div className="reveal-item" data-delay={delay}>
      <p className="font-display text-4xl md:text-5xl font-extrabold text-brand-navy">
        {prefix}<span ref={ref}>0</span>{suffix}
      </p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-neutral-500">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-brand-navy/5 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
