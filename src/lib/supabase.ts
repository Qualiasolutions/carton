import { createClient } from '@supabase/supabase-js'

// Types for our database
export interface Lead {
  id: string
  ghl_contact_id: string | null
  name: string
  phone: string
  email: string | null
  status: 'new' | 'calling' | 'called' | 'booked' | 'lost'
  appointment_time: string | null
  notes: string | null
  ghl_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Call {
  id: string
  lead_id: string
  vapi_call_id: string | null
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  transcript: string | null
  summary: string | null
  duration_seconds: number | null
  ended_reason: string | null
  cost: number | null
  created_at: string
}

// Browser client
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client with service role (for API routes)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
