import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CART_STORAGE_KEY = 's4a_cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    const available = product.stock ?? 0;
    if (available <= 0) {
      window.__toast?.('error', 'Ce produit n\'est plus en stock.');
      return false;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        const newQty = Math.min(existing.qty + (product.qty || 1), available);
        return prev.map((item) =>
          item.product_id === product.product_id ? { ...item, qty: newQty } : item
        );
      }
      return [...prev, { ...product, qty: Math.min(product.qty || 1, available) }];
    });
    return true;
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const updateQty = useCallback((productId, newQty) => {
    if (newQty <= 0) {
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, qty: Math.min(newQty, item.stock ?? 0) } : item
      )
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unit_price_dzd * item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
