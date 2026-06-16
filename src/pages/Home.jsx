import SEOHead from '../components/ui/SEOHead';
import HeroSection from '../components/sections/HeroSection';
import ServicesOverview from '../components/sections/ServicesOverview';
import WhyUsSection from '../components/sections/WhyUsSection';
import StatsSection from '../components/sections/StatsSection';
import CTABanner from '../components/sections/CTABanner';
import TestimonialsSection from '../components/sections/TestimonialsSection';

export default function Home() {
  return (
    <>
      <SEOHead
        title="solution4all — Maintenance informatique et services IT en Algérie"
        description="solution4all accompagne les entreprises algériennes : maintenance informatique, réseaux, logiciels et support sur mesure. Demandez un devis gratuit."
        path="/"
      />
      <HeroSection />
      <ServicesOverview />
      <WhyUsSection />
      <StatsSection />
      <CTABanner />
      <TestimonialsSection />
    </>
  );
}
