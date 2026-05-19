'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ExternalLink, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminOrdersContentProps {
  orders: Order[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped: 'bg-purple-500/10 text-purple-600',
  delivered: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-600',
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const paymentStatusLabels: Record<string, string> = {
  awaiting_admin_review: 'Awaiting admin review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function AdminOrdersContent({ orders }: AdminOrdersContentProps) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update order status')
      router.refresh()
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Orders</h1>
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No orders yet</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const items = Array.isArray(order.items) ? order.items : []
          const formattedTotal = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IRR',
            maximumFractionDigits: 0,
          }).format(order.total_amount)

          return (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_email}
                    </p>
                    {order.customer_phone && (
                      <p className="text-sm text-muted-foreground">
                        {order.customer_phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formattedTotal}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mb-4 p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {items.map((item: any, i: number) => (
                        <li key={i}>
                          {item.product?.title_en || 'Product'} x{item.quantity} ({item.selectedSize})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {order.shipping_address && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Shipping Address:</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address}
                    </p>
                  </div>
                )}

                <div className="mb-4 grid gap-3 rounded-lg bg-secondary/50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-muted-foreground">
                      {order.payment_method === 'gateway'
                        ? 'Gateway'
                        : order.payment_method === 'card_to_card'
                          ? 'Card to card'
                          : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Payment Status</p>
                    <p className="text-muted-foreground">
                      {paymentStatusLabels[order.payment_status] || order.payment_status || 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Tracking Number</p>
                    <p className="text-muted-foreground">
                      {order.payment_tracking_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Receipt</p>
                    {order.payment_receipt_url ? (
                      <a
                        href={order.payment_receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        View receipt
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium capitalize',
                      statusColors[order.status]
                    )}
                  >
                    {order.status}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingId === order.id}
                      >
                        {updatingId === order.id ? 'Updating...' : 'Update Status'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {statusOptions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => updateStatus(order.id, status)}
                          className="capitalize"
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
