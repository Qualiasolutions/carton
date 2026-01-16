import { LeadsTable } from '@/components/leads-table'
import { createServerClient } from '@/lib/supabase'

// Demo data for when Supabase is not configured
const demoLeads = [
  {
    id: '1',
    ghl_contact_id: 'demo-1',
    name: 'Sarah Mitchell',
    phone: '+447700900001',
    email: 'sarah.mitchell@example.com',
    status: 'new' as const,
    appointment_time: null,
    notes: null,
    ghl_data: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    calls: []
  },
  {
    id: '2',
    ghl_contact_id: 'demo-2',
    name: 'James Cooper',
    phone: '+447700900002',
    email: 'james.cooper@example.com',
    status: 'called' as const,
    appointment_time: null,
    notes: 'Interested in cosmetic consultation',
    ghl_data: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    calls: [
      {
        id: 'call-1',
        lead_id: '2',
        vapi_call_id: 'vapi-123',
        status: 'completed' as const,
        transcript: 'Agent: Hello, this is Sophie calling from the medical practice...\nCustomer: Yes, hello...',
        summary: 'Customer interested, wants to schedule next week',
        duration_seconds: 180,
        ended_reason: 'customer-ended-call',
        cost: 0.15,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  {
    id: '3',
    ghl_contact_id: 'demo-3',
    name: 'Emma Thompson',
    phone: '+447700900003',
    email: 'emma.t@example.com',
    status: 'booked' as const,
    appointment_time: new Date(Date.now() + 172800000).toISOString(),
    notes: 'Initial consultation',
    ghl_data: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    calls: [
      {
        id: 'call-2',
        lead_id: '3',
        vapi_call_id: 'vapi-456',
        status: 'completed' as const,
        transcript: null,
        summary: 'Appointment booked successfully',
        duration_seconds: 240,
        ended_reason: 'assistant-ended-call',
        cost: 0.20,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  {
    id: '4',
    ghl_contact_id: 'demo-4',
    name: 'Michael Brown',
    phone: '+447700900004',
    email: null,
    status: 'lost' as const,
    appointment_time: null,
    notes: 'Not interested at this time',
    ghl_data: null,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    calls: [
      {
        id: 'call-3',
        lead_id: '4',
        vapi_call_id: 'vapi-789',
        status: 'completed' as const,
        transcript: null,
        summary: 'Customer not interested',
        duration_seconds: 45,
        ended_reason: 'customer-ended-call',
        cost: 0.05,
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  },
  {
    id: '5',
    ghl_contact_id: 'demo-5',
    name: 'Lisa Anderson',
    phone: '+447700900005',
    email: 'lisa.anderson@example.com',
    status: 'new' as const,
    appointment_time: null,
    notes: null,
    ghl_data: null,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    calls: []
  },
]

async function getLeads() {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Supabase not configured, using demo data')
    return demoLeads
  }

  try {
    const supabase = createServerClient()

    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        calls (
          id,
          vapi_call_id,
          status,
          transcript,
          summary,
          duration_seconds,
          ended_reason,
          cost,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return demoLeads
    }

    return leads || demoLeads
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return demoLeads
  }
}

export default async function DashboardPage() {
  const leads = await getLeads()
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-semibold">Carton</h1>
              <p className="text-xs text-muted-foreground">Voice AI Lead Follow-up</p>
            </div>
          </div>

          {isDemo && (
            <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <span className="text-xs text-yellow-500 font-medium">Demo Mode</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isDemo && (
          <div className="mb-6 p-4 bg-muted/50 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Mode:</strong> Configure environment variables to connect to Supabase and GoHighLevel.
              See <code className="px-1.5 py-0.5 bg-muted rounded text-xs">.env.example</code> for required variables.
            </p>
          </div>
        )}

        <LeadsTable initialLeads={leads} />
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>Concept Carton Demo</p>
          <p>Powered by VAPI + GoHighLevel</p>
        </div>
      </footer>
    </div>
  )
}
