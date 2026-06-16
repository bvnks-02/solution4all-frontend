import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { colorMap } from '../../data/colorMap';

export default function ServiceCard({ service, compact = false }) {
  const Icon = LucideIcons[service.icon_name];
  const colors = colorMap[service.color_class] || colorMap.blue;

  if (compact) {
    return (
      <div className="group bg-white rounded-xl shadow-card border border-neutral-200/60 p-6 md:p-8 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-250 ease-spring reveal-item">
        {service.image && (
          <div className="w-full h-32 rounded-lg overflow-hidden mb-5 bg-neutral-100">
            <img
              src={service.image}
              alt={service.title_fr}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 ${colors.hoverBg} transition-colors duration-250`}>
          {Icon ? <Icon size={22} strokeWidth={1.75} className={`${colors.text} ${colors.hoverText} transition-colors duration-250`} /> : null}
        </div>
        <h3 className="font-display text-xl font-semibold text-neutral-900 mb-2">{service.title_fr}</h3>
        <p className="text-base text-neutral-700 leading-relaxed">{service.description_fr}</p>
        <Link
          to={`/services#${service.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-gold transition-colors duration-200 group/link"
        >
          En savoir plus
          <ArrowRight size={14} className="transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-xl shadow-card border border-neutral-200/60 p-6 md:p-8 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-250 ease-spring">
      {service.image && (
        <div className="w-full h-40 rounded-lg overflow-hidden mb-5 bg-neutral-100">
          <img
            src={service.image}
            alt={service.title_fr}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-5 ${colors.hoverBg} transition-colors duration-250`}>
        {Icon ? <Icon size={28} strokeWidth={1.75} className={`${colors.text} ${colors.hoverText} transition-colors duration-250`} /> : null}
      </div>
      <h3 className="font-display text-xl font-semibold text-neutral-900 mb-2">{service.title_fr}</h3>
      <p className="text-base text-neutral-700 leading-relaxed">{service.description_fr}</p>
      <ul className="mt-4 space-y-2">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-neutral-700">
            <span className="text-brand-gold mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/contact?dept=${service.department}`}
          className="inline-flex items-center justify-center font-display font-semibold rounded-lg bg-brand-gold text-neutral-900 shadow-sm hover:bg-brand-goldDark hover:-translate-y-0.5 hover:shadow-card-hover transition-[color,background-color,transform,box-shadow] duration-250 ease-spring px-5 py-2.5 text-sm gap-2"
        >
          Demander un devis
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center font-display font-semibold rounded-lg border-2 border-brand-navy text-brand-navy bg-transparent hover:bg-brand-navy hover:text-white hover:-translate-y-0.5 hover:shadow-card-hover transition-[color,background-color,transform,box-shadow,border-color] duration-250 ease-spring px-5 py-2.5 text-sm gap-2"
        >
          Nous contacter
        </Link>
      </div>
    </div>
  );
}