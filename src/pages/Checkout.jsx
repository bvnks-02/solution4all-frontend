import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, AlertCircle } from 'lucide-react';

import SEOHead from '../components/ui/SEOHead';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Select from '../components/ui/Select';

import { useCart } from '../context/CartContext';
import { formatDZD } from '../lib/format';
import { orderSchema } from '../lib/validators';
import { collection } from '../lib/api';
import { wilayaOptions } from '../data/wilayas';
import { useScrollTop } from '../hooks/useScrollTop';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clear, subtotal } = useCart();
  const [formState, setFormState] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useScrollTop();

  // Redirect to boutique if cart becomes empty (unless we just succeeded)
  useEffect(() => {
    if (items.length === 0 && formState !== 'success') {
      navigate('/boutique', { replace: true });
    }
  }, [items, navigate, formState]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_company: '',
      wilaya: '',
      address: '',
      notes: '',
      website: '',
    },
  });

  const inputClass = (fieldName) =>
    `w-full rounded-xl border px-4 py-3 text-neutral-900 text-base font-sans placeholder:text-neutral-500 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 ${
      errors[fieldName]
        ? 'border-error focus:border-error focus:ring-error/20 text-error bg-red-50'
        : 'border-neutral-200 bg-neutral-100 hover:border-neutral-400 focus:border-brand-navy focus:ring-brand-navy/20'
    }`;

  const labelClass =
    'block text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-1.5';

  const onSubmit = async (data) => {
    // Honeypot check — if website field is filled, silently succeed (spam bot)
    if (data.website) {
      setFormState('success');
      setTimeout(() => navigate('/boutique', { replace: true }), 1500);
      return;
    }

    setFormState('submitting');
    setServerError('');

    try {
      const orderData = {
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_company: data.customer_company || '',
        wilaya: data.wilaya,
        address: data.address,
        notes: data.notes || '',
        items: items.map((item) => ({
          product_id: item.product_id,
          name_fr: item.name_fr,
          qty: item.qty,
          unit_price_dzd: item.unit_price_dzd,
        })),
        subtotal_dzd: subtotal,
        total_dzd: subtotal,
        source: 'boutique',
      };

      const order = await collection('orders').create(orderData);
      clear();
      setOrderNumber(order.order_number || '');
      setFormState('success');
      setTimeout(() => {
        navigate('/boutique', { state: { orderSuccess: true }, replace: true });
      }, 5000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        'Une erreur est survenue. Veuillez réessayer.';
      setServerError(message);
      setFormState('error');
    }
  };

  // Prevent flash of content when redirecting on empty cart
  if (items.length === 0 && formState !== 'success') {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Commande"
        description="Finalisez votre demande de devis pour du matériel informatique et des solutions IT. solution4all vous accompagne en Algérie."
        path="/commande"
      />

      {/* Hero banner */}
      <section className="bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold mb-3">
            Commande
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Finalisez votre commande
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Remplissez le formulaire ci-dessous pour recevoir votre devis personnalisé
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* — Order Summary — */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-neutral-50 rounded-2xl p-6 md:p-8 border border-neutral-200 sticky top-24">
                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-6">
                  Résumé de la commande
                </h3>

                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag
                      size={48}
                      strokeWidth={1.75}
                      className="text-neutral-300 mx-auto mb-4"
                    />
                    <p className="text-neutral-500 font-medium">Votre panier est vide</p>
                    <Button variant="secondary" size="sm" href="/boutique" className="mt-4">
                      Voir les produits
                    </Button>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-4 mb-6">
                      {items.map((item) => (
                        <li
                          key={item.product_id}
                          className="flex gap-3 pb-4 border-b border-neutral-200 last:border-0"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-lg bg-neutral-200 flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name_fr}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <ShoppingBag size={18} />
                              </div>
                            )}
                          </div>
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {item.name_fr}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Qté : {item.qty}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatDZD(item.unit_price_dzd)} l'unité
                            </p>
                          </div>
                          {/* Line total */}
                          <p className="text-sm font-semibold text-neutral-900 whitespace-nowrap">
                            {formatDZD(item.unit_price_dzd * item.qty)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between py-3 border-t border-neutral-300">
                      <span className="text-base font-semibold text-neutral-900">Sous-total</span>
                      <span className="text-lg font-bold text-brand-navy">
                        {formatDZD(subtotal)}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-neutral-500 italic">
                      Les frais de livraison seront communiqués lors de la confirmation.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* — Customer Form — */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-6">
                Informations de livraison
              </h3>

              {formState === 'success' ? (
                <div className="text-center py-12 animate-scale-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-success mb-4">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-neutral-900">
                    Commande envoyée !
                  </h3>
                  {orderNumber && (
                    <p className="mt-4 text-lg font-bold text-brand-navy bg-brand-navy/5 border border-brand-navy/20 rounded-xl px-6 py-3 inline-block select-all">
                      {orderNumber}
                    </p>
                  )}
                  <p className="mt-4 text-neutral-500">
                    Merci pour votre commande. Notre équipe vous contactera rapidement pour la
                    confirmation et les détails de livraison.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {formState === 'error' && serverError && (
                    <Alert
                      type="error"
                      message={serverError}
                      onDismiss={() => setFormState('idle')}
                    />
                  )}

                  {/* Honeypot — visually hidden, invisible to real users */}
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      type="text"
                      {...register('website')}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Nom complet */}
                  <div>
                    <label htmlFor="customer_name" className={labelClass}>
                      Nom complet *
                    </label>
                    <input
                      id="customer_name"
                      type="text"
                      {...register('customer_name')}
                      className={inputClass('customer_name')}
                      placeholder="Votre nom complet"
                    />
                    {errors.customer_name && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down">
                        <AlertCircle size={14} />
                        {errors.customer_name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="customer_email" className={labelClass}>
                      Email *
                    </label>
                    <input
                      id="customer_email"
                      type="email"
                      {...register('customer_email')}
                      className={inputClass('customer_email')}
                      placeholder="votre@email.com"
                    />
                    {errors.customer_email && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down">
                        <AlertCircle size={14} />
                        {errors.customer_email.message}
                      </p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label htmlFor="customer_phone" className={labelClass}>
                      Téléphone *
                    </label>
                    <input
                      id="customer_phone"
                      type="tel"
                      {...register('customer_phone')}
                      className={inputClass('customer_phone')}
                      placeholder="0X XX XX XX XX"
                    />
                    {errors.customer_phone && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down">
                        <AlertCircle size={14} />
                        {errors.customer_phone.message}
                      </p>
                    )}
                  </div>

                  {/* Société (optionnel) */}
                  <div>
                    <label htmlFor="customer_company" className={labelClass}>
                      Société
                    </label>
                    <input
                      id="customer_company"
                      type="text"
                      {...register('customer_company')}
                      className={inputClass('customer_company')}
                      placeholder="Nom de votre entreprise (optionnel)"
                    />
                  </div>

                  {/* Wilaya */}
                  <div>
                    <Select
                      label="Wilaya *"
                      id="wilaya"
                      value={watch('wilaya')}
                      onChange={(e) =>
                        setValue('wilaya', e.target.value, { shouldValidate: true })
                      }
                      options={[
                        { value: '', label: 'Sélectionnez une wilaya' },
                        ...wilayaOptions,
                      ]}
                      className={
                        errors.wilaya
                          ? '[&_select]:border-error [&_select]:focus:border-error [&_select]:focus:ring-error/20 [&_select]:text-error [&_select]:bg-red-50'
                          : ''
                      }
                    />
                    {errors.wilaya && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down">
                        <AlertCircle size={14} />
                        {errors.wilaya.message}
                      </p>
                    )}
                  </div>

                  {/* Adresse */}
                  <div>
                    <label htmlFor="address" className={labelClass}>
                      Adresse *
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      {...register('address')}
                      className={`${inputClass('address')} resize-y min-h-[80px]`}
                      placeholder="Numéro, rue, cité, commune…"
                    />
                    {errors.address && (
                      <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down">
                        <AlertCircle size={14} />
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Notes supplémentaires */}
                  <div>
                    <label htmlFor="notes" className={labelClass}>
                      Notes supplémentaires
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      {...register('notes')}
                      className={`${inputClass('notes')} resize-y min-h-[80px]`}
                      placeholder="Informations complémentaires (optionnel)"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={formState === 'submitting'}
                      className="w-full sm:w-auto"
                    >
                      {formState === 'submitting' ? 'Envoi en cours…' : 'Envoyer la commande'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
