import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../SEO';

interface StoreFrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const StoreFront: React.FC<StoreFrontProps> = ({ products, onAddToCart }) => {
  // Hero Image
  const heroImage = "https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&q=80&w=2000";

  return (
    <div className="animate-fade-in">
      <SEO 
        title="Luxury Floral Arrangements" 
        description="Shop our exclusive collection of hand-crafted floral arrangements. Perfect for weddings, gifts, and home decor." 
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Florist workshop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <span className="block text-secondary uppercase tracking-[0.2em] mb-4 text-sm font-bold animate-slide-up">
            Artistry in Bloom
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight animate-slide-up delay-100">
            Send Flowers <br/> Like You Mean It
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto font-light animate-slide-up delay-200">
            Hand-crafted arrangements sourced from sustainable farms. Delivered with care, destined to impress.
          </p>
          <div className="animate-slide-up delay-300">
            <a 
              href="#collection" 
              className="inline-flex items-center px-8 py-3 bg-white text-gray-900 text-sm font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors duration-300"
            >
              Shop Collection
            </a>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section id="collection" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">Curated Selections</h2>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
            />
          ))}
        </div>
      </section>

      {/* Brand Story Snippet */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1596564239857-e68d069b0725?auto=format&fit=crop&q=80&w=1000" 
              alt="Florist working" 
              className="w-full h-full object-cover rounded-sm shadow-xl" 
            />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/10 -z-10 rounded-sm"></div>
          </div>
          <div>
            <h3 className="font-serif text-3xl text-gray-900 mb-6">Designed for Emotion</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We believe flowers are more than just decoration; they are a language. 
              Our design philosophy centers on letting nature speak. We source unique 
              blooms that you won't find at the corner bodega, arranging them in 
              ways that feel both organic and structural.
            </p>
            <a href="#" className="inline-flex items-center text-primary font-bold hover:text-secondary transition-colors group">
              Read Our Story <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};