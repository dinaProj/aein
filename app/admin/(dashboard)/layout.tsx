import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!isAdminSessionValid(session)) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
