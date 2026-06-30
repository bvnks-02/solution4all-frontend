import SectionHeading from '../ui/SectionHeading';

const partners = [
  { name: 'AK Print', src: '/images/partners/AK-Print.png' },
  { name: 'Artelia', src: '/images/partners/Artelia.png' },
  { name: 'Asia PUB', src: '/images/partners/asiaPUB.png' },
  { name: 'AV Metal', src: '/images/partners/AVMETAL.png' },
  { name: 'Casa Paint', src: '/images/partners/Casa-Paint.png' },
  { name: 'CETI', src: '/images/partners/CETI.png' },
  { name: 'Culture Libre', src: '/images/partners/Culture-Libre.png' },
  { name: 'Fiat', src: '/images/partners/fFIAT.png' },
  { name: 'Intelli', src: '/images/partners/INTELLI.png' },
  { name: 'Jaztex', src: '/images/partners/Jaztex.png' },
  { name: 'Nouveau Leader', src: '/images/partners/nouveau-Leader.png' },
  { name: 'Opel', src: '/images/partners/OPEL.png' },
  { name: 'Tiscoba', src: '/images/partners/Tiscoba.png' },
  { name: 'TPC', src: '/images/partners/TPC.jpeg' },
  { name: 'White Cube', src: '/images/partners/WHITECUBE.png' },
  { name: 'Wildane', src: '/images/partners/Wildane.png' },
];

function LogoItem({ name, src, ...rest }) {
  return (
    <li className="flex shrink-0 items-center justify-center px-8 md:px-12" {...rest}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        className="h-20 md:h-28 w-auto max-w-[220px] object-contain"
      />
    </li>
  );
}

export default function PartnersSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Ils nous font confiance"
          title="Nos partenaires et clients"
          subtitle="Des entreprises algériennes qui comptent sur solution4all au quotidien"
        />
      </div>

      {/* Endless looping logo marquee */}
      <div
        className="group relative w-full overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <ul className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {partners.map((partner) => (
            <LogoItem key={partner.name} {...partner} />
          ))}
          {/* Duplicated set so the track loops seamlessly */}
          {partners.map((partner) => (
            <LogoItem key={`${partner.name}-dup`} {...partner} aria-hidden="true" />
          ))}
        </ul>
      </div>
    </section>
  );
}
