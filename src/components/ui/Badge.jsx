const colorMap = {
  navy: 'bg-brand-navy/10 text-brand-navy',
  gold: 'bg-brand-gold/20 text-neutral-900',
  teal: 'bg-brand-tealLight text-brand-teal',
  neutral: 'bg-neutral-100 text-neutral-700',
  success: 'bg-green-50 text-success',
  error: 'bg-red-50 text-error',
  blue: 'bg-brand-navy/10 text-brand-navy',
  green: 'bg-green-50 text-success',
  red: 'bg-red-50 text-error',
  gray: 'bg-neutral-100 text-neutral-700',
  indigo: 'bg-indigo-100 text-indigo-600',
  purple: 'bg-purple-100 text-purple-600',
};

export default function Badge({ children, color = 'navy', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest ${colorMap[color] || colorMap.navy} ${className}`}
    >
      {children}
    </span>
  );
}
