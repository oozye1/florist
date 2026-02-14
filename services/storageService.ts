import { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const PRODUCTS_KEY = 'lumina_products';
const ORDERS_KEY = 'lumina_orders';

// --- Products ---

export const getProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load products", error);
    return INITIAL_PRODUCTS;
  }
};

export const saveProduct = (product: Product): Product[] => {
  const current = getProducts();
  const index = current.findIndex(p => p.id === product.id);
  let updated: Product[];
  
  if (index >= 0) {
    updated = [...current];
    updated[index] = product;
  } else {
    updated = [product, ...current];
  }
  
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteProduct = (id: string): Product[] => {
  const current = getProducts();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  return updated;
};

// --- Orders ---

export const getOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load orders", error);
    return [];
  }
};

export const saveOrder = (order: Order): Order[] => {
  const current = getOrders();
  const updated = [order, ...current];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  return updated;
};

export const updateOrderStatus = (orderId: string, status: Order['status']): Order[] => {
  const current = getOrders();
  const updated = current.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  return updated;
};

// --- Utils ---

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};