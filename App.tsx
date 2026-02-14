import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StoreFront } from './components/Store/StoreFront';
import { ProductDetails } from './components/Store/ProductDetails';
import { Dashboard } from './components/Admin/Dashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { CartDrawer } from './components/Cart/CartDrawer';
import { CheckoutModal } from './components/Checkout/CheckoutModal';
import { AIChatAssistant } from './components/Chat/AIChatAssistant';
import { Product, CartItem } from './types';
import { getProducts, saveOrder } from './services/storageService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    // Load products
    setProducts(getProducts());
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handlePlaceOrder = (customer: { name: string; email: string; address: string }) => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newOrder = {
      id: Date.now().toString(),
      items: cart,
      total,
      status: 'PENDING' as const,
      customer,
      createdAt: new Date().toISOString()
    };
    
    saveOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    alert(`Thank you for your order, ${customer.name}! We will start arranging your flowers soon.`);
  };

  return (
    <BrowserRouter>
      <div className="font-sans antialiased text-gray-900 bg-white">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <Layout 
              cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
              onOpenCart={() => setIsCartOpen(true)}
            >
              <StoreFront products={products} onAddToCart={handleAddToCart} />
              <AIChatAssistant />
            </Layout>
          } />

          <Route path="/product/:id" element={
            <Layout 
              cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
              onOpenCart={() => setIsCartOpen(true)}
            >
              <ProductDetails onAddToCart={handleAddToCart} />
              <AIChatAssistant />
            </Layout>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={
            isAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLogin onLogin={() => setIsAuthenticated(true)} />
          } />

          <Route path="/admin/dashboard" element={
            isAuthenticated ? (
              <Dashboard onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate to="/admin/login" />
            )
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* Overlay Components */}
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={() => setIsCheckoutOpen(true)}
        />

        {isCheckoutOpen && (
          <CheckoutModal 
            total={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
            onClose={() => setIsCheckoutOpen(false)}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;