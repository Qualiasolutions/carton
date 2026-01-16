import { NextRequest, NextResponse } from 'next/server'
import { createOutboundCall } from '@/lib/vapi'

const DEMO_NUMBER = '+447920274763' // Jay Skipworth

export async function POST(request: NextRequest) {
  try {
    const { leadId, leadName } = await request.json()

    const assistantId = process.env.VAPI_ASSISTANT_ID
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID

    if (!assistantId || !phoneNumberId) {
      return NextResponse.json({ error: 'VAPI not configured' }, { status: 500 })
    }

    // Call immediately
    const vapiCall = await createOutboundCall({
      assistantId,
      phoneNumberId,
      customerNumber: DEMO_NUMBER,
      assistantOverrides: {
        variableValues: {
          lead_name: leadName || 'there',
          practice_name: 'Concept Carton'
        }
      }
    })

    return NextResponse.json({ success: true, callId: vapiCall.id })

  } catch (error) {
    console.error('Call error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Call failed'
    }, { status: 500 })
  }
}
