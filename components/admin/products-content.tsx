'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { formatRial } from '@/lib/format'
import type { Product, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AdminProductsContentProps {
  products: Product[]
  categories: Category[]
}

type ProductFormData = {
  title_fa: string
  title_en: string
  description_fa: string
  description_en: string
  price: number
  category_id: string
  product_type: Product['product_type']
  images: string[]
  sizes: string[]
  payment_link: string
  is_featured: boolean
  stock: number
}

const emptyProduct: ProductFormData = {
  title_fa: '',
  title_en: '',
  description_fa: '',
  description_en: '',
  price: 0,
  category_id: '',
  product_type: 'canvas',
  images: [],
  sizes: [],
  payment_link: '',
  is_featured: false,
  stock: 0,
}

export function AdminProductsContent({
  products,
  categories,
}: AdminProductsContentProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState(emptyProduct)
  const [isLoading, setIsLoading] = useState(false)
  const [newImage, setNewImage] = useState('')
  const [newSize, setNewSize] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const isOutOfStock = formData.stock <= 0

  const handleEdit = (product: Product) => {
    setMessage(null)
    setSelectedProduct(product)
    setFormData({
      title_fa: product.title_fa,
      title_en: product.title_en,
      description_fa: product.description_fa || '',
      description_en: product.description_en || '',
      price: product.price,
      category_id: product.category_id || '',
      product_type: product.product_type,
      images: product.images,
      sizes: product.sizes,
      payment_link: product.payment_link || '',
      is_featured: product.is_featured,
      stock: product.stock,
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setMessage(null)
    setSelectedProduct(null)
    setFormData(emptyProduct)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to delete product')
      }
      setMessage('محصول با موفقیت حذف شد.')
      router.refresh()
    } catch (error) {
      console.error('Error deleting product:', error)
      setMessage(error instanceof Error ? error.message : 'حذف محصول انجام نشد.')
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const productData = {
        ...formData,
        category_id: formData.category_id || null,
        payment_link: formData.payment_link || null,
      }

      const response = await fetch(
        selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products',
        {
          method: selectedProduct ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save product')
      }

      setIsDialogOpen(false)
      setMessage(selectedProduct ? 'محصول با موفقیت ویرایش شد.' : 'محصول با موفقیت ساخته شد.')
      router.refresh()
    } catch (error) {
      console.error('Error saving product:', error)
      setMessage(error instanceof Error ? error.message : 'ذخیره محصول انجام نشد.')
    } finally {
      setIsLoading(false)
    }
  }

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] })
      setNewImage('')
    }
  }

  const resizeImageFile = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const image = new window.Image()

        image.onload = () => {
          const maxSize = 1200
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
          const width = Math.round(image.width * scale)
          const height = Math.round(image.height * scale)
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          if (!context) {
            reject(new Error('Could not process image'))
            return
          }

          canvas.width = width
          canvas.height = height
          context.drawImage(image, 0, 0, width, height)
          resolve(canvas.toDataURL('image/webp', 0.82))
        }

        image.onerror = () => reject(new Error('Could not read image'))
        image.src = String(reader.result)
      }

      reader.onerror = () => reject(new Error('Could not read image'))
      reader.readAsDataURL(file)
    })
  }

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return

    setIsLoading(true)
    setMessage(null)

    try {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      )

      if (imageFiles.length === 0) {
        throw new Error('لطفا یک فایل تصویر انتخاب کنید.')
      }

      const uploadedImages = await Promise.all(imageFiles.map(resizeImageFile))
      setFormData((current) => ({
        ...current,
        images: [...current.images, ...uploadedImages],
      }))
      setMessage('تصویر اضافه شد. برای ثبت نهایی تغییرات، روی ذخیره بزنید.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'آپلود تصویر انجام نشد.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const addSize = () => {
    if (newSize.trim()) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] })
      setNewSize('')
    }
  }

  const removeSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">محصولات</h1>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          افزودن محصول
        </Button>
      </div>

      {message && (
        <div className="mb-4 rounded-md border border-border bg-secondary/60 p-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={product.images[0] || '/placeholder.jpg'}
                    alt={product.title_en}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{product.title_en}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.title_fa}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-medium text-primary">
                      {formatRial(product.price, 'admin')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      موجودی: {product.stock}
                    </span>
                    {product.stock <= 0 && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        اتمام موجودی
                      </span>
                    )}
                    {product.is_featured && (
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
                        ویژه
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setSelectedProduct(product)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'ویرایش محصول' : 'افزودن محصول'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (English) *</Label>
                <Input
                  required
                  value={formData.title_en}
                  onChange={(e) =>
                    setFormData({ ...formData, title_en: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Title (Persian) *</Label>
                <Input
                  required
                  dir="rtl"
                  value={formData.title_fa}
                  onChange={(e) =>
                    setFormData({ ...formData, title_fa: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (English)</Label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  value={formData.description_en}
                  onChange={(e) =>
                    setFormData({ ...formData, description_en: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description (Persian)</Label>
                <textarea
                  rows={3}
                  dir="rtl"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  value={formData.description_fa}
                  onChange={(e) =>
                    setFormData({ ...formData, description_fa: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  disabled={isOutOfStock}
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Product Type *</Label>
                <select
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.product_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      product_type: e.target.value as 'canvas' | 'tshirt' | 'poster',
                    })
                  }
                >
                  <option value="canvas">Mug (Coming Soon) / ماگ (بزودی)</option>
                  <option value="tshirt">T-Shirt</option>
                  <option value="poster">Poster</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Payment Link</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.payment_link}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_link: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <Label>Images</Label>
              <div className="mb-3">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isLoading}
                  onChange={(e) => {
                    uploadImages(e.target.files)
                    e.target.value = ''
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload product images from your device, then click Save.
                </p>
              </div>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Image URL"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addImage}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group w-16 h-16 rounded overflow-hidden bg-muted"
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Label>Sizes</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., S, M, L, 50x70"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addSize}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm"
                  >
                    {size}
                    <button type="button" onClick={() => removeSize(i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="rounded border-input"
              />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Featured Product
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_out_of_stock"
                checked={isOutOfStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: e.target.checked ? 0 : 1,
                  })
                }
                className="rounded border-input"
              />
              <Label htmlFor="is_out_of_stock" className="cursor-pointer">
                Out of Stock / اتمام موجودی
              </Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
