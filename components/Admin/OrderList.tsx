import React from 'react';
import { Order, OrderStatus } from '../../types';
import { Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onUpdateStatus }) => {
  const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);

  const statusColors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'PROCESSING': 'bg-blue-100 text-blue-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    'PENDING': <Clock className="w-4 h-4" />,
    'PROCESSING': <Truck className="w-4 h-4" />,
    'DELIVERED': <CheckCircle className="w-4 h-4" />,
    'CANCELLED': <XCircle className="w-4 h-4" />,
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Orders Yet</h3>
        <p className="text-gray-500 mt-1">When customers place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
          {/* Header Row */}
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
          >
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Order ID</span>
                <p className="font-mono font-medium text-gray-900">#{order.id.slice(-6)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Date</span>
                <p className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Customer</span>
                <p className="text-sm text-gray-900">{order.customer.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium space-x-1 ${statusColors[order.status]}`}>
                {statusIcons[order.status]}
                <span>{order.status}</span>
              </span>
              <span className="font-serif font-bold text-lg">${order.total.toFixed(2)}</span>
              {expandedOrder === order.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>

          {/* Expanded Details */}
          {expandedOrder === order.id && (
            <div className="px-6 py-6 bg-gray-50 border-t border-gray-100 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                  <ul className="space-y-3">
                    {order.items.map(item => (
                      <li key={item.id} className="flex items-start justify-between">
                        <div className="flex items-center">
                          <img src={item.imageUrl} className="w-10 h-10 object-cover rounded mr-3" alt="" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions & Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Shipping Details</h4>
                  <p className="text-sm text-gray-600 mb-1">{order.customer.address}</p>
                  <p className="text-sm text-gray-600 mb-6">{order.customer.email}</p>

                  <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => onUpdateStatus(order.id, status)}
                        className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                          order.status === status 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};