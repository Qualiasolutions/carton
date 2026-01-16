import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getContacts, GHLContact } from '@/lib/gohighlevel'

// Sync leads from GoHighLevel
export async function POST() {
  try {
    const supabase = createServerClient()
    const locationId = process.env.GHL_LOCATION_ID

    if (!locationId) {
      return NextResponse.json({ error: 'GHL_LOCATION_ID not configured' }, { status: 500 })
    }

    // Fetch contacts from GHL
    const contacts = await getContacts(locationId)

    // Upsert into leads table
    const leads = contacts.map((contact: GHLContact) => ({
      ghl_contact_id: contact.id,
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown',
      phone: contact.phone || '',
      email: contact.email,
      ghl_data: contact
    }))

    const { data, error } = await supabase
      .from('leads')
      .upsert(leads, { onConflict: 'ghl_contact_id', ignoreDuplicates: false })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      synced: data?.length || 0,
      leads: data
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Sync failed'
    }, { status: 500 })
  }
}

// Get current leads
export async function GET() {
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
          duration_seconds,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leads })

  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json({ error: 'Failed to get leads' }, { status: 500 })
  }
}
