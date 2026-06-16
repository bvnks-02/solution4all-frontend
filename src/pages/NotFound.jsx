import { useLocation } from 'react-router-dom';
import SEOHead from '../components/ui/SEOHead';
import Button from '../components/ui/Button';

export default function NotFound() {
  const location = useLocation();
  return (
    <>
      <SEOHead
        title="Page introuvable"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        path={location.pathname}
      />
      <section className="bg-neutral-50 py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p aria-hidden="true" className="font-display text-6xl font-extrabold text-brand-gold">404</p>
          <h1 className="mt-4 font-display text-3xl font-bold text-neutral-900">Page introuvable</h1>
          <p className="mt-4 text-lg text-neutral-500">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="mt-8">
            <Button variant="primary" href="/">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
