import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Islamabad Traffic Watch',
  description: 'Real-time road status for Islamabad — updated by ITP and community reports',
  keywords: ['Islamabad traffic', 'road status', 'ITP', 'traffic updates'],
  openGraph: {
    title: 'Islamabad Traffic Watch',
    description: 'Check if roads are open or blocked in Islamabad',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}