import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Velvet Midnight Rose',
    description: 'A luxurious arrangement of deep red Baccara roses accented with eucalyptus and midnight blue thistle. Perfect for romantic gestures.',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&q=80&w=800',
    category: 'Romance',
    tags: ['roses', 'red', 'luxury'],
    inStock: true,
  },
  {
    id: '2',
    name: 'Spring Awakening',
    description: 'Vibrant tulips, daffodils, and hyacinths presented in a rustic woven basket. Brings the freshness of spring indoors.',
    price: 55.00,
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800',
    category: 'Seasonal',
    tags: ['spring', 'tulips', 'fresh'],
    inStock: true,
  },
  {
    id: '3',
    name: 'Ethereal White Lilies',
    description: 'Elegant white Oriental lilies combined with soft greenery. A symbol of purity and refined beauty, suitable for any sophisticated occasion.',
    price: 72.50,
    imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac92a900275?auto=format&fit=crop&q=80&w=800',
    category: 'Sympathy',
    tags: ['lilies', 'white', 'elegant'],
    inStock: true,
  },
  {
    id: '4',
    name: 'Bohemian Wildflower',
    description: 'An unstructured, organic bouquet featuring sunflowers, delphiniums, and chamomile. Ideal for the free spirit.',
    price: 64.00,
    imageUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=800',
    category: 'Everyday',
    tags: ['wildflowers', 'rustic', 'colorful'],
    inStock: true,
  }
];