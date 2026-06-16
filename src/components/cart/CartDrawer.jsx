import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatDZD } from '../../lib/format';
import Button from '../ui/Button';

export default function CartDrawer({ isOpen, onClose }) {
  const drawerRef = useRef(null);
  const { items, updateQty, removeItem, clear, subtotal, count } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus trap and Esc key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-modal animate-slide-in-right flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Panier ({count})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:outline-none"
            aria-label="Fermer le panier"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag size={48} strokeWidth={1.75} className="text-neutral-300 mb-4" />
              <p className="text-neutral-500 font-medium">Votre panier est vide</p>
              <p className="text-sm text-neutral-400 mt-1">
                Découvrez nos produits et ajoutez-les à votre panier
              </p>
              <Button variant="secondary" size="sm" href="/boutique" className="mt-4" onClick={onClose}>
                Voir les produits
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.product_id} className="flex gap-4 py-4 border-b border-neutral-100 last:border-0">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name_fr} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.name_fr}</p>
                    <p className="text-sm text-neutral-500 mt-0.5">{formatDZD(item.unit_price_dzd)}</p>
                    {/* Qty stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.product_id, item.qty - 1)}
                        className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium text-neutral-900 w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product_id, item.qty + 1)}
                        className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Price and remove */}
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-sm font-semibold text-neutral-900">{formatDZD(item.unit_price_dzd * item.qty)}</p>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1 text-neutral-400 hover:text-error transition-colors duration-150"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-neutral-700">Total</span>
              <span className="text-lg font-bold text-neutral-900">{formatDZD(subtotal)}</span>
            </div>
            <Button variant="primary" size="lg" href="/commande" className="w-full" onClick={onClose}>
              Passer la commande
            </Button>
            <button
              onClick={clear}
              className="w-full text-sm text-neutral-500 hover:text-error transition-colors duration-150 text-center"
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
}
