'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomOrder } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminCustomOrdersContentProps {
  customOrders: CustomOrder[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  reviewed: 'bg-blue-500/10 text-blue-600',
  quoted: 'bg-purple-500/10 text-purple-600',
  completed: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-600',
}

const statusOptions = ['pending', 'reviewed', 'quoted', 'completed', 'cancelled']

export function AdminCustomOrdersContent({
  customOrders,
}: AdminCustomOrdersContentProps) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const response = await fetch(`/api/custom-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update custom order status')
      router.refresh()
    } catch (error) {
      console.error('Error updating custom order status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (customOrders.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Custom Orders</h1>
        <div className="text-center py-16 text-muted-foreground">
          <Palette className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No custom orders yet</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Custom Orders</h1>

      <div className="space-y-4">
        {customOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="font-semibold">{order.name}</p>
                  <p className="text-sm text-muted-foreground">{order.email}</p>
                  {order.phone && (
                    <p className="text-sm text-muted-foreground">{order.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                    {order.product_type}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4 p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Description:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.description}
                </p>
              </div>

              {order.file_url && (
                <div className="mb-4">
                  <a
                    href={order.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Attached File
                  </a>
                </div>
              )}

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
        ))}
      </div>
    </div>
  )
}
