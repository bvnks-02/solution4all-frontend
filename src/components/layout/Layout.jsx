import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useScrollTop } from '../../hooks/useScrollTop';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import PageTransition from '../ui/PageTransition';

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  useAnalytics();
  useScrollTop();
  useScrollReveal();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1 pt-16">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
