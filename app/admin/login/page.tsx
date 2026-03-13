'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Wrong password. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚦</div>
          <h1 className="text-white text-2xl font-bold">Traffic Watch</h1>
          <p className="text-zinc-500 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <label className="block text-zinc-400 text-sm mb-2">
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter your password"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
                       text-white placeholder-zinc-600 focus:outline-none
                       focus:border-zinc-500 transition-colors mb-4"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full bg-white text-zinc-950 font-semibold py-3 rounded-xl
                       hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}