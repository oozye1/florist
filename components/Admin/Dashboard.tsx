import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus } from '../../types';
import { getProducts, saveProduct, deleteProduct, getOrders, updateOrderStatus } from '../../services/storageService';
import { ProductForm } from './ProductForm';
import { OrderList } from './OrderList';
import { Button } from '../ui/Button';
import { Plus, Trash2, Edit2, Package, ShoppingCart } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

type Tab = 'PRODUCTS' | 'ORDERS';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('PRODUCTS');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Load data
  useEffect(() => {
    setProducts(getProducts());
    setOrders(getOrders());
  }, []);

  // --- Product Handlers ---
  const handleSaveProduct = (product: Product) => {
    const updated = saveProduct(product);
    setProducts(updated);
    setIsEditing(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updated = deleteProduct(id);
      setProducts(updated);
    }
  };

  const startEdit = (product?: Product) => {
    setEditingProduct(product);
    setIsEditing(true);
  };

  // --- Order Handlers ---
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = updateOrderStatus(orderId, status);
    setOrders(updated);
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <ProductForm 
          initialData={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => setIsEditing(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your floral inventory and customer orders</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onLogout}>Logout</Button>
            {activeTab === 'PRODUCTS' && (
              <Button onClick={() => startEdit()}>
                <Plus className="h-5 w-5 mr-2" /> Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'PRODUCTS' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inventory
          </button>
          <button
             onClick={() => setActiveTab('ORDERS')}
             className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center ${
              activeTab === 'ORDERS' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
            <span className="ml-2 bg-secondary text-white text-xs px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
             <div className="p-3 rounded-full bg-green-100 text-primary mr-4">
               <Package className="h-6 w-6" />
             </div>
             <div>
               <p className="text-sm text-gray-500 font-medium uppercase">Total Products</p>
               <p className="text-2xl font-bold text-gray-900">{products.length}</p>
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
             <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
               <ShoppingCart className="h-6 w-6" />
             </div>
             <div>
               <p className="text-sm text-gray-500 font-medium uppercase">Pending Orders</p>
               <p className="text-2xl font-bold text-gray-900">
                 {orders.filter(o => o.status === 'PENDING').length}
               </p>
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
             <div className="p-3 rounded-full bg-gray-100 text-gray-800 mr-4">
               <span className="font-serif font-bold">$</span>
             </div>
             <div>
               <p className="text-sm text-gray-500 font-medium uppercase">Revenue (Est)</p>
               <p className="text-2xl font-bold text-gray-900">
                 ${orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.total, 0).toFixed(0)}
               </p>
             </div>
           </div>
        </div>

        {/* Content Area */}
        {activeTab === 'PRODUCTS' ? (
           <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden">
                          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        ${product.price.toFixed(2)}
                      </td>
                       <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.inStock ? 'In Stock' : 'Sold Out'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => startEdit(product)}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <OrderList orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
        )}

      </div>
    </div>
  );
};