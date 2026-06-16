import Badge from './Badge';

export default function SectionHeading({ label, title, subtitle, align = 'center' }) {
  const alignment = align === 'left' ? 'text-left' : 'text-center';
  return (
    <div className={`mb-12 md:mb-16 ${alignment}`}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">
          {label}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 max-w-2xl mx-auto leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-neutral-700 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="mt-6 mx-auto h-1 w-16 rounded-full bg-brand-gold" />
    </div>
  );
}
