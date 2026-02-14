import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  total: number;
  onClose: () => void;
  onPlaceOrder: (customer: { name: string; email: string; address: string }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ total, onClose, onPlaceOrder }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    card: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder({
      name: formData.name,
      email: formData.email,
      address: formData.address
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
        <div className="bg-primary px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-serif text-xl">Secure Checkout</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Total Amount</p>
            <p className="text-4xl font-serif text-gray-900 mt-1">${total.toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <Input 
              label="Full Name" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Email Address" 
              type="email" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Shipping Address" 
              required 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
            <Input 
              label="Card Number (Mock)" 
              placeholder="0000 0000 0000 0000"
              value={formData.card}
              onChange={e => setFormData({...formData, card: e.target.value})}
            />
          </div>

          <div className="pt-4">
             <Button type="submit" className="w-full py-4 text-lg">
               Pay & Place Order
             </Button>
             <p className="flex items-center justify-center mt-3 text-xs text-gray-500">
               <ShieldCheck className="w-3 h-3 mr-1" /> 
               Secure SSL Encrypted Transaction
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};