import Image from 'next/image'
import { Calendar } from '@/components/calendar'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-teal-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/50 blur-xl rounded-full" />
              <Image
                src="/logo.svg"
                alt="Concept Carton"
                width={180}
                height={40}
                priority
                className="relative brightness-0 invert"
              />
            </div>
            <div className="h-6 w-px bg-white/20" />
            <span className="text-xs font-medium text-emerald-400/80 tracking-wider uppercase">Voice AI</span>
          </div>
          <nav className="flex items-center gap-2">
            <a href="/" className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg">
              Calendar
            </a>
            <a
              href="/call"
              className="group relative px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              <span className="relative flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Sophie
              </span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Appointments
          </h1>
          <p className="text-white/50 mt-2 text-lg">
            Booked by Sophie during calls
          </p>
        </div>

        <Calendar />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-white/30 text-sm">Concept Carton</p>
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Powered by VAPI
          </div>
        </div>
      </footer>
    </div>
  )
}
