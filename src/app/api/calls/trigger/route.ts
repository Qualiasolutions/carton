import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createOutboundCall } from '@/lib/vapi'

// Trigger an outbound call to a lead
export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json()
    const supabase = createServerClient()

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!lead.phone) {
      return NextResponse.json({ error: 'Lead has no phone number' }, { status: 400 })
    }

    // Check required env vars
    const assistantId = process.env.VAPI_ASSISTANT_ID
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID

    if (!assistantId || !phoneNumberId) {
      return NextResponse.json({
        error: 'VAPI not configured. Set VAPI_ASSISTANT_ID and VAPI_PHONE_NUMBER_ID'
      }, { status: 500 })
    }

    // Create call record first
    const { data: callRecord, error: callError } = await supabase
      .from('calls')
      .insert({
        lead_id: leadId,
        status: 'pending'
      })
      .select()
      .single()

    if (callError) {
      return NextResponse.json({ error: 'Failed to create call record' }, { status: 500 })
    }

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'calling' })
      .eq('id', leadId)

    // Trigger VAPI call
    const vapiCall = await createOutboundCall({
      assistantId,
      phoneNumberId,
      customerNumber: lead.phone,
      assistantOverrides: {
        variableValues: {
          lead_name: lead.name,
          practice_name: 'Medical Practice' // TODO: Make configurable
        }
      }
    })

    // Update call record with VAPI call ID
    await supabase
      .from('calls')
      .update({ vapi_call_id: vapiCall.id })
      .eq('id', callRecord.id)

    return NextResponse.json({
      success: true,
      callId: callRecord.id,
      vapiCallId: vapiCall.id
    })

  } catch (error) {
    console.error('Trigger call error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to trigger call'
    }, { status: 500 })
  }
}
