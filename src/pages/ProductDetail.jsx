import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, FileText, ChevronRight, Package } from 'lucide-react';
import SEOHead from '../components/ui/SEOHead';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { collection, getFileURL } from '../lib/api';
import { formatDZD } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useScrollTop } from '../hooks/useScrollTop';

const categoryLabels = {
  ordinateurs: 'Ordinateurs',
  imprimantes: 'Imprimantes',
  onduleurs: 'Onduleurs',
  serveurs: 'Serveurs',
  consommables: 'Consommables',
  logiciels: 'Logiciels',
  licences: 'Licences logicielles',
};

const categoryBadgeColors = {
  ordinateurs: 'blue',
  imprimantes: 'teal',
  onduleurs: 'gold',
  serveurs: 'purple',
  consommables: 'green',
  logiciels: 'indigo',
  licences: 'cyan',
};

export default function ProductDetail() {
  useScrollTop();

  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        const record = await collection('products').getFirstListItem(
          `slug="${slug}"&&active=true`
        );

        if (!cancelled) {
          setProduct(record);
          setSelectedImageIndex(0);
          setQuantity(1);
          setAddedToCart(false);
        }
      } catch (err) {
        if (!cancelled) {
          // Product not found or inactive — redirect to boutique
          navigate('/boutique', { replace: true });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      fetchProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setAddedToCart(false);
  }, [product?.id]);

  if (loading) {
    return (
      <>
        <SEOHead
          title="Chargement…"
          description=""
          path={`/boutique/${slug}`}
        />
        <section className="bg-neutral-50 min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-neutral-500 text-sm">Chargement du produit…</p>
          </div>
        </section>
      </>
    );
  }

  // If product is null after loading, the redirect already happened
  if (!product) {
    return null;
  }

  const images = product.images || [];
  const mainImageUrl = images.length > 0
    ? getFileURL(product, images[selectedImageIndex] || images[0])
    : null;
  const inStock = product.stock > 0;
  const badgeColor = categoryBadgeColors[product.category] || 'neutral';

  // JSON-LD structured data for Product schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_fr,
    description: product.description_fr?.substring(0, 500) || '',
    image: mainImageUrl || undefined,
    sku: product.sku || product.id,
    brand: product.brand
      ? { '@type': 'Brand', name: product.brand }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: 'DZD',
      price: product.price_dzd,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'solution4all',
      },
    },
  };

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      slug: product.slug,
      name_fr: product.name_fr,
      unit_price_dzd: product.price_dzd,
      stock: product.stock,
      image: images.length > 0 ? getFileURL(product, images[0]) : null,
      qty: quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const increaseQty = () => {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  return (
    <>
      <SEOHead
        title={`${product.name_fr}`}
        description={product.description_fr?.substring(0, 160) || `${product.name_fr} — solution4all Algérie`}
        path={`/boutique/${product.slug}`}
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb + Page Hero */}
      <section className="bg-brand-navy py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-white/60 mb-4 flex flex-wrap items-center gap-1">
            <Link to="/" className="hover:text-brand-gold transition-colors">Accueil</Link>
            <ChevronRight size={14} className="text-white/40" />
            <Link to="/boutique" className="hover:text-brand-gold transition-colors">Boutique</Link>
            <ChevronRight size={14} className="text-white/40" />
            <span className="text-white truncate max-w-[200px] md:max-w-xs">{product.name_fr}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-4">
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name_fr}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <ShoppingBag size={64} />
                  </div>
                )}
                {!inStock && (
                  <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-white bg-error px-4 py-2 rounded-lg">
                      Rupture de stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        index === selectedImageIndex
                          ? 'border-brand-navy ring-2 ring-brand-navy/20'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <img
                        src={getFileURL(product, image)}
                        alt={`${product.name_fr} — vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category + Brand */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge color={badgeColor}>
                  {categoryLabels[product.category] || product.category}
                </Badge>
                {product.brand && (
                  <Badge color="neutral">{product.brand}</Badge>
                )}
              </div>

              {/* Product Name */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                {product.name_fr}
              </h1>

              {/* Price */}
              <p className="mt-4 text-3xl font-bold text-brand-navy">
                {formatDZD(product.price_dzd)}
              </p>

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-2">
                {inStock ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-success">En stock</span>
                    {product.stock <= 5 && (
                      <span className="text-sm text-neutral-500">
                        (Plus que {product.stock} exemplaire{product.stock > 1 ? 's' : ''})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-error" />
                    <span className="text-sm font-medium text-error">Rupture de stock</span>
                  </>
                )}
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="mt-2 text-xs text-neutral-400">
                  Réf. : {product.sku}
                </p>
              )}

              {/* Description */}
              {product.description_fr && (
                <div className="mt-6 prose prose-sm prose-neutral max-w-none">
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                    {product.description_fr}
                  </p>
                </div>
              )}

              {/* Add to Cart Controls */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                {inStock ? (
                  <>
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-semibold text-neutral-700">Quantité :</span>
                      <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                        <button
                          onClick={decreaseQty}
                          disabled={quantity <= 1}
                          className="p-2.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold text-neutral-900 select-none">
                          {quantity}
                        </span>
                        <button
                          onClick={increaseQty}
                          disabled={quantity >= product.stock}
                          className="p-2.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className="flex-1"
                      >
                        <ShoppingBag size={20} />
                        {addedToCart ? 'Ajouté au panier ✓' : 'Ajouter au panier'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        href="/contact?dept=commercial"
                      >
                        <FileText size={20} />
                        Demander un devis
                      </Button>
                    </div>

                    {/* Success feedback */}
                    {addedToCart && (
                      <div className="mt-4">
                        <Alert
                          type="success"
                          message={`${product.name_fr} a été ajouté à votre panier.`}
                          onDismiss={() => setAddedToCart(false)}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="primary" size="lg" disabled className="flex-1">
                      <ShoppingBag size={20} />
                      Ajouter au panier
                    </Button>
                    <Button variant="secondary" size="lg" href="/contact?dept=commercial">
                      <FileText size={20} />
                      Demander un devis
                    </Button>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <div className="flex items-start gap-3 text-sm text-neutral-600">
                  <Package size={20} className="shrink-0 text-brand-navy mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900">Livraison professionnelle</p>
                    <p className="mt-0.5">
                      Contactez notre équipe commerciale pour un devis personnalisé avec livraison.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
