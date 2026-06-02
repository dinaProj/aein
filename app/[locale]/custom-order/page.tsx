import type { Locale } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Palette } from 'lucide-react'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function CustomOrderPage({ params }: PageProps) {
  const { locale } = await params

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Card className="mx-auto max-w-lg">
          <CardContent className="p-8 text-center">
            <Palette className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h1 className="mb-3 text-2xl font-bold">
              {locale === 'fa' ? 'سفارش طرح دلخواه فعلا غیرفعال است' : 'Custom Design Orders Are Disabled'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'fa'
                ? 'این بخش موقتا در دسترس نیست و بعدا دوباره فعال می‌شود.'
                : 'This section is temporarily unavailable and will be enabled later.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
