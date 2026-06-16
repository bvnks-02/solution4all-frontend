import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-brand-gold text-neutral-900 shadow-sm hover:bg-brand-goldDark hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:ring-brand-goldDark active:bg-brand-goldDark active:scale-[0.98] active:shadow-none active:translate-y-0',
  secondary:
    'border-2 border-brand-navy text-brand-navy bg-transparent hover:bg-brand-navy hover:text-white hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:ring-brand-navy active:bg-brand-navyDark active:text-white active:scale-[0.98] active:translate-y-0',
  ghost:
    'text-brand-navy underline-offset-4 bg-transparent hover:underline hover:text-brand-navyDark focus-visible:ring-brand-navy active:text-brand-navyDark active:opacity-80',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-7 py-3.5 text-lg gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-display font-semibold rounded-lg transition-[color,background-color,transform,box-shadow,opacity,border-color] duration-250 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
  const disabledClasses = disabled ? 'bg-neutral-200 text-neutral-500 shadow-none pointer-events-none' : '';
  const classes = `${baseClasses} ${disabled ? disabledClasses : variants[variant]} ${sizes[size]} ${className}`;

  if (loading) {
    return (
      <button type={type} className={classes} disabled {...props}>
        <Spinner size="sm" className="text-neutral-900 mr-2" />
        {children}
      </button>
    );
  }

  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a href={href} className={classes} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
