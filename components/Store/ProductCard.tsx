import React from 'react';
import { Product } from '../../types';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100 cursor-pointer">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1 text-xs uppercase tracking-widest">Sold Out</span>
          </div>
        )}
      </Link>
      
      <div className="relative p-6 flex flex-col flex-grow">
        {/* Floating Add Button overlapping image/content */}
        <div className="absolute top-0 right-4 -translate-y-1/2 z-10">
           <Button 
             variant="primary" 
             onClick={(e) => {
               e.preventDefault();
               onAddToCart(product);
             }}
             className="!rounded-full !p-3 shadow-lg hover:scale-110 transition-transform"
             title="Add to Cart"
             disabled={!product.inStock}
           >
             <Plus className="h-5 w-5" />
           </Button>
        </div>

        <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">
          {product.category}
        </div>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-serif text-xl text-gray-900 mb-2 leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-lg font-medium text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};