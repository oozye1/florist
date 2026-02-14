export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  tags: string[];
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewState = 'STORE' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';

export interface AIAnalysisResult {
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}