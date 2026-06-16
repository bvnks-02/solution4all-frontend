import SEOHead from '../components/ui/SEOHead';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';

export default function Contact() {
  return (
    <>
      <SEOHead
        title="Contactez solution4all — Devis gratuit"
        description="Contactez notre équipe par email ou téléphone. Réponse rapide garantie. Devis gratuit et sans engagement."
        path="/contact"
      />
      <section className="bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">Contact</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Contactez-nous
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
        </div>
      </section>
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactInfo />
            <div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-6">Envoyez-nous un message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
