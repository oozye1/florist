import React from 'react';
import { ShoppingBag, Menu, X, User, Flower } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  onOpenCart: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, cartCount, onOpenCart }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center cursor-pointer">
              <Flower className="h-8 w-8 text-primary mr-2" />
              <span className="font-serif text-2xl font-bold text-gray-900 tracking-tight">
                Lumina Florals
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/"
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Collection
              </Link>
              <span className="text-sm font-medium text-gray-300 cursor-not-allowed">
                Weddings
              </span>
              <span className="text-sm font-medium text-gray-300 cursor-not-allowed">
                About
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-6">
              <Link 
                to="/admin/login"
                className="text-gray-400 hover:text-primary transition-colors"
                title="Admin Access"
              >
                <User className="h-5 w-5" />
              </Link>
              
              <button 
                onClick={onOpenCart}
                className="relative cursor-pointer group"
              >
                <ShoppingBag className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              >
                Collection
              </Link>
              <Link 
                to="/admin/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-paper">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl mb-4">Lumina Florals</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Crafting moments of natural beauty for your most cherished occasions. 
              Sustainably sourced, artfully arranged.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-secondary">Contact</h4>
            <p className="text-gray-300 text-sm">123 Blossom Avenue</p>
            <p className="text-gray-300 text-sm">New York, NY 10012</p>
            <p className="text-gray-300 text-sm mt-2">hello@luminaflorals.com</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-secondary">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Pinterest</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center text-xs text-gray-400">
          © 2024 Lumina Florals. All rights reserved.
        </div>
      </footer>
    </div>
  );
};