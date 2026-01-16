import Image from 'next/image'
import { Calendar } from '@/components/calendar'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Concept Carton"
              width={180}
              height={40}
              priority
            />
            <span className="text-xs text-muted-foreground border-l pl-2 ml-1">Voice AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium">Calendar</a>
            <a href="/leads" className="text-sm text-muted-foreground hover:text-foreground">Leads</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Appointments booked by Sophie during calls
          </p>
        </div>

        <Calendar />
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>Concept Carton</p>
          <p>Powered by VAPI</p>
        </div>
      </footer>
    </div>
  )
}
