import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { getProducts } from '../../services/storageService';
import { Button } from '../ui/Button';
import { ArrowLeft, Check, Plus, Tag } from 'lucide-react';
import { SEO } from '../SEO';

interface ProductDetailsProps {
  onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const products = getProducts();
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <SEO 
        title={product.name} 
        description={product.description} 
        image={product.imageUrl}
        type="product"
        price={product.price}
        availability={product.inStock}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {!product.inStock && (
               <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="bg-gray-900 text-white px-4 py-2 uppercase tracking-widest font-bold">Sold Out</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <span className="text-secondary font-bold uppercase tracking-wider text-sm">
                {product.category}
              </span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
              {product.name}
            </h1>

            <p className="text-2xl font-light text-gray-900 mb-8">
              ${product.price.toFixed(2)}
            </p>

            <div className="prose prose-stone text-gray-600 mb-10">
              <p>{product.description}</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-center text-sm text-gray-500">
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Sustainably Sourced
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Hand-Arranged in NY
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => onAddToCart(product)} 
                disabled={!product.inStock}
                className="flex-1 py-4 text-lg"
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Tag className="w-4 h-4" />
                {product.tags.join(', ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};