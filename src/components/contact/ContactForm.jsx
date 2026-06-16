import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { contactSchema } from '../../lib/validators';
import { collection } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import DepartmentSelector from './DepartmentSelector';

export default function ContactForm() {
  const [searchParams] = useSearchParams();
  const [formState, setFormState] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const location = useLocation();

  const defaultDept = searchParams.get('dept') || 'general';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      company: '',
      department: ['general', 'commercial', 'ecommerce', 'technical'].includes(defaultDept) ? defaultDept : 'general',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setFormState('submitting');
    trackEvent('form_submit', '/contact', 'contact_form');

    try {
      await collection('contact_submissions').create({
        ...data,
        status: 'new',
        source_page: location.pathname,
      });
      trackEvent('form_success', '/contact', 'contact_form');
      setFormState('success');
    } catch (err) {
      trackEvent('form_error', '/contact', 'contact_form');
      const message = err?.response?.data?.message || err.message || 'Une erreur est survenue. Veuillez réessayer plus tard.';
      setServerError(message);

      // Capture field-level errors if the server returns them
      if (err?.response?.data?.data) {
        setFieldErrors(err.response.data.data);
      }
      setFormState('error');
    }
  };

  const serverFieldError = (field) => {
    const err = fieldErrors[field];
    if (!err) return null;
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return null;
  };

  const inputClass = (fieldName) =>
    `w-full rounded-xl border px-4 py-3 text-neutral-900 text-base font-sans placeholder:text-neutral-500 transition-all duration-200 focus:outline-none focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/20 ${
      errors[fieldName] || serverFieldError(fieldName) ? 'border-error bg-red-50' : 'border-neutral-200 bg-neutral-100 hover:border-neutral-400'
    }`;

  const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-1.5';

  if (formState === 'success') {
    return (
      <div className="text-center py-12 animate-scale-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/20 text-brand-gold mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-semibold text-neutral-900">Message envoyé !</h3>
        <p className="mt-2 text-neutral-500">
          Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setFormState('idle');
            reset();
          }}
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formState === 'error' && (
        <Alert
          type="error"
          message={serverError}
          onDismiss={() => { setFormState('idle'); setServerError(''); setFieldErrors({}); }}
        />
      )}

      <div>
        <label htmlFor="full_name" className={labelClass}>Nom complet *</label>
        <input id="full_name" type="text" {...register('full_name')} className={inputClass('full_name')} placeholder="Votre nom complet" />
        {errors.full_name && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{errors.full_name.message}</p>}
        {serverFieldError('full_name') && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{serverFieldError('full_name')}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email *</label>
        <input id="email" type="email" {...register('email')} className={inputClass('email')} placeholder="votre@email.com" />
        {errors.email && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{errors.email.message}</p>}
        {serverFieldError('email') && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{serverFieldError('email')}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>Téléphone</label>
        <input id="phone" type="tel" {...register('phone')} className={inputClass('phone')} placeholder="0X XX XX XX XX" />
      </div>

      <div>
        <label htmlFor="company" className={labelClass}>Société</label>
        <input id="company" type="text" {...register('company')} className={inputClass('company')} placeholder="Nom de votre entreprise" />
      </div>

      <DepartmentSelector
        value={watch('department')}
        onChange={(e) => setValue('department', e.target.value)}
        error={errors.department?.message}
      />

      <div>
        <label htmlFor="subject" className={labelClass}>Objet *</label>
        <input id="subject" type="text" {...register('subject')} className={inputClass('subject')} placeholder="L'objet de votre message" />
        {errors.subject && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{errors.subject.message}</p>}
        {serverFieldError('subject') && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{serverFieldError('subject')}</p>}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message *</label>
        <textarea id="message" rows={5} {...register('message')} className={`${inputClass('message')} resize-y min-h-[120px]`} placeholder="Décrivez votre besoin en détail (minimum 20 caractères)" />
        {errors.message && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{errors.message.message}</p>}
        {serverFieldError('message') && <p className="mt-1.5 text-sm text-error flex items-center gap-1 animate-slide-down"><AlertCircle size={14} />{serverFieldError('message')}</p>}
      </div>

      <Button type="submit" variant="primary" size="lg" loading={formState === 'submitting'} className="w-full sm:w-auto">
        Envoyer le message
      </Button>
    </form>
  );
}
