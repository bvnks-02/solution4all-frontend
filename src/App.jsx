import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Boutique from './pages/Boutique';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import ResetPassword from './pages/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';
import AdminResetPassword from './admin/AdminResetPassword';
import AdminActivateAccount from './admin/AdminActivateAccount';
import { AdminProvider } from './admin/AdminContext';
import AdminRoute from './admin/AdminRoute';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/boutique" element={<Boutique />} />
              <Route path="/boutique/:slug" element={<ProductDetail />} />
              <Route path="/commande" element={<Checkout />} />
            </Route>
            {/* Auth pages — outside admin layout, no nav header */}
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/activate-account/:token" element={<ActivateAccount />} />
            {/* Admin auth pages — query param tokens for email links */}
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin/activate-account" element={<AdminActivateAccount />} />
            <Route path="/admin/*" element={
              <AdminProvider>
                <AdminRoute />
              </AdminProvider>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
