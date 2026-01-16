import Image from 'next/image'
import { LeadsTable } from '@/components/leads-table'
import { createServerClient } from '@/lib/supabase'

async function getLeads() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return []
  }

  try {
    const supabase = createServerClient()
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`*, calls (id, vapi_call_id, status, transcript, summary, duration_seconds, ended_reason, cost, created_at)`)
      .order('created_at', { ascending: false })

    if (error) return []
    return leads || []
  } catch {
    return []
  }
}

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Concept Carton" width={180} height={40} priority />
            <span className="text-xs text-muted-foreground border-l pl-2 ml-1">Voice AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">Calendar</a>
            <a href="/leads" className="text-sm font-medium">Leads</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <LeadsTable initialLeads={leads} />
      </main>

      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>Concept Carton</p>
          <p>Powered by VAPI</p>
        </div>
      </footer>
    </div>
  )
}
