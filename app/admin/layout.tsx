'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show header on login page
  if (pathname === '/admin/login') return <>{children}</>

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚦</span>
            <div>
              <span className="text-white font-semibold">Traffic Watch</span>
              <span className="text-zinc-500 text-sm ml-2">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            <a
              href="/"
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              View Site →
            </a>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
}