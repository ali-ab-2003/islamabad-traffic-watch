'use client'
import { useState } from 'react'
import Link from 'next/link'
import ReportForm from './components/ReportForm'
import RecentCommunityReports from './components/RecentCommunityReports'

export default function ReportPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800/60 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-zinc-500 hover:text-white transition-colors text-sm"
            >
              ← Back
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <h1 className="text-white font-bold leading-none">
                  Report an Issue
                </h1>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Help Islamabad commuters in real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* How it works */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { emoji: '📍', title: 'Select Area',   desc: 'Pick the affected location' },
            { emoji: '🚦', title: 'Pick Status',   desc: 'What is the situation?' },
            { emoji: '📤', title: 'Submit',         desc: 'Admin reviews & publishes' },
          ].map(step => (
            <div key={step.title}
              className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-3">
              <div className="text-2xl mb-1.5">{step.emoji}</div>
              <p className="text-white text-xs font-semibold">{step.title}</p>
              <p className="text-zinc-500 text-xs mt-0.5 leading-tight">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Form */}
        <ReportForm onSubmitted={() => setRefreshKey(k => k + 1)} />

        {/* Recent community reports */}
        <div>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>👥</span> Recent Community Reports
          </h2>
          <RecentCommunityReports refreshKey={refreshKey} />
        </div>
      </div>
          {/* Sticky bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20
                      bg-zinc-900/95 backdrop-blur border-t border-zinc-800/60">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <Link href="/"
              className="flex flex-col items-center gap-1 py-2 px-6
                         text-zinc-500 hover:text-white transition-colors">
              <span className="text-xl">🏠</span>
              <span className="text-xs">Home</span>
            </Link>
            <Link href="/map"
              className="flex flex-col items-center gap-1 py-2 px-6
                         text-zinc-500 hover:text-white transition-colors">
              <span className="text-xl">🗺️</span>
              <span className="text-xs">Map</span>
            </Link>
            <Link href="/report"
              className="flex flex-col items-center gap-1 py-2 px-6 text-white">
              <span className="text-xl">⚠️</span>
              <span className="text-xs font-medium">Report</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="max-w-lg mx-auto px-4 pb-8 mt-4">
        <p className="text-zinc-600 text-xs text-center leading-relaxed">
          Reports are reviewed before being published. Spam and false reports
          are removed by the community.
        </p>
      </div>
    </div>
  )
}