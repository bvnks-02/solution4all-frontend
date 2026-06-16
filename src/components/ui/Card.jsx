export default function Card({ children, className = '', hoverable = false }) {
  const baseClasses = 'bg-white rounded-xl shadow-card border border-neutral-200/60 p-6 md:p-8 transition-all duration-250 ease-spring';
  const hoverClasses = hoverable
    ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 focus-visible:outline-none'
    : '';
  return <div className={`${baseClasses} ${hoverClasses} ${className}`}>{children}</div>;
}
