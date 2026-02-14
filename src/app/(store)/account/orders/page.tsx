'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Eye, Loader2 } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { getIdToken } from '@/lib/firebase/auth'

const SAMPLE_ORDERS = [
  {
    id: 'ord-001',
    orderNumber: 'LB-20260210-001',
    status: 'delivered',
    total: 89.99,
    itemCount: 1,
    createdAt: '2026-02-10T14:30:00Z',
    deliveryDate: '2026-02-11',
    items: [{ name: 'Velvet Red Romance' }],
  },
  {
    id: 'ord-002',
    orderNumber: 'LB-20260213-002',
    status: 'preparing',
    total: 134.98,
    itemCount: 2,
    createdAt: '2026-02-13T09:15:00Z',
    deliveryDate: '2026-02-14',
    items: [{ name: 'Blush Pink Elegance' }, { name: 'Chocolate & Blooms' }],
  },
  {
    id: 'ord-003',
    orderNumber: 'LB-20260214-001',
    status: 'confirmed',
    total: 249.99,
    itemCount: 1,
    createdAt: '2026-02-14T08:00:00Z',
    deliveryDate: '2026-02-15',
    items: [{ name: 'The Grand Gesture' }],
  },
]

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<typeof SAMPLE_ORDERS>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  async function fetchOrders() {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) {
        setOrders(SAMPLE_ORDERS)
        return
      }
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      if (data.orders && data.orders.length > 0) {
        setOrders(data.orders)
      } else {
        setOrders(SAMPLE_ORDERS)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders(SAMPLE_ORDERS)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-serif text-2xl mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground mb-6">
          When you place your first order, it will appear here.
        </p>
        <Link
          href="/products"
          className="text-primary font-medium hover:underline"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">Order History</h2>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = ORDER_STATUSES[order.status]
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-bold">
                      {order.orderNumber}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-medium px-2.5 py-0.5 rounded-full',
                        status?.color
                      )}
                    >
                      {status?.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.map((i) => i.name).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed {formatDate(order.createdAt)} &middot; Delivery{' '}
                    {formatDate(order.deliveryDate)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-input hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
