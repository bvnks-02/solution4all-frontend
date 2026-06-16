import SEOHead from '../components/ui/SEOHead';
import CTABanner from '../components/sections/CTABanner';
import { ShieldCheck, Users, Lightbulb } from 'lucide-react';

const values = [
  {
    icon: ShieldCheck,
    title: 'Fiabilité',
    description: 'Nous tenons nos engagements et nos délais, toujours.',
  },
  {
    icon: Users,
    title: 'Proximité',
    description: 'Une équipe locale, disponible, qui connaît vos besoins.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Nous suivons les évolutions technologiques pour vous proposer le meilleur.',
  },
];

const team = [
  { initials: 'AB', name: "Membre de l'équipe", role: 'Directeur technique' },
  { initials: 'CD', name: "Membre de l'équipe", role: 'Responsable commercial' },
  { initials: 'EF', name: "Membre de l'équipe", role: 'Ingénieur réseau' },
];

export default function About() {
  return (
    <>
      <SEOHead
        title="À propos de solution4all"
        description="Plus de 10 ans d'expérience au service des entreprises algériennes. Découvrez notre équipe et nos valeurs."
        path="/a-propos"
      />

      {/* Page Hero */}
      <section className="bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">Qui sommes-nous</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            À propos de solution4all
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Une entreprise algérienne au service des entreprises algériennes
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-neutral-900">Notre histoire</h2>
              <p className="mt-4 text-lg text-neutral-700">
                Fondée en Algérie, solution4all accompagne depuis plus de 10 ans les entreprises
                locales dans leur transformation numérique. Notre mission : fournir des solutions IT
                fiables, accessibles et adaptées aux réalités du marché algérien.
              </p>
              <p className="mt-4 text-lg text-neutral-700">
                Notre équipe de techniciens certifiés intervient rapidement, que ce soit à distance
                ou sur site, pour garantir la continuité de votre activité.
              </p>
            </div>
            <div className="hidden lg:flex justify-center" aria-hidden="true">
              <div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-brand-navy/10 to-brand-teal/10 flex items-center justify-center">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" fill="#1A56DB" opacity="0.1" />
                  <circle cx="100" cy="100" r="50" fill="#1A56DB" opacity="0.15" />
                  <path d="M70 100L90 80L90 90L130 90L130 110L90 110L90 120L70 100Z" fill="#1A56DB" opacity="0.4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-neutral-900">Nos valeurs</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-navy text-white">
                    <Icon size={28} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-neutral-900">{value.title}</h3>
                  <p className="mt-2 text-neutral-500">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-900">Notre équipe</h2>
          <p className="mt-4 text-neutral-500">Des professionnels dévoués à votre succès</p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.initials} className="bg-neutral-50 rounded-xl p-6">
                <div className="w-20 h-20 rounded-full bg-brand-gold text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  {member.initials}
                </div>
                <h3 className="mt-4 font-semibold text-neutral-900">{member.name}</h3>
                <p className="text-sm text-neutral-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
