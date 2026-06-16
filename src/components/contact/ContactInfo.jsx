import { Mail, Phone } from 'lucide-react';

const departments = [
  { name: 'Contact général', email: 'contact@solution4all.dz', phone: null },
  { name: 'Commercial', email: 'commercial@solution4all.dz', phone: { display: '0665 020 020', href: '+213665020020' } },
  { name: 'E-commerce', email: 'e-commerce@solution4all.dz', phone: null },
  { name: 'Technique', email: 'technique@solution4all.dz', phone: { display: '0770 336 007', href: '+213770336007' } },
];

export default function ContactInfo() {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-neutral-900 mb-6">Nos coordonnées</h3>
      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.name} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/60">
            <h4 className="font-display font-semibold text-neutral-900 text-sm">{dept.name}</h4>
            <div className="mt-2 space-y-1">
              <a href={`mailto:${dept.email}`} className="flex items-center gap-2 text-sm text-brand-navy hover:text-brand-gold transition-colors duration-200">
                <Mail size={16} strokeWidth={1.75} />
                {dept.email}
              </a>
              {dept.phone && (
                <a href={`tel:${dept.phone.href}`} className="flex items-center gap-2 text-sm text-neutral-700 hover:text-brand-navy transition-colors duration-200">
                  <Phone size={16} strokeWidth={1.75} />
                  {dept.phone.display}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
