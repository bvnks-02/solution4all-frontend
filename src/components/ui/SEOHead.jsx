import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.solution4all.dz'; // hardcoded (no env var)

export default function SEOHead({ title, description, path = '/', ogType = 'website' }) {
  const fullTitle = title
    ? `${title} — solution4all`
    : 'solution4all — Votre clinique informatique';
  const fullUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="fr_DZ" />
      <meta property="og:site_name" content="solution4all" />
    </Helmet>
  );
}
