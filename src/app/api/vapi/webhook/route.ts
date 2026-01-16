import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    console.log('VAPI Webhook:', JSON.stringify(body, null, 2))

    const messageType = body.message?.type

    switch (messageType) {
      case 'tool-calls': {
        const results = await Promise.all(
          body.message.toolCalls.map(async (toolCall: { id: string; function: { name: string; arguments: Record<string, unknown> } }) => {
            const { name, arguments: args } = toolCall.function

            if (name === 'book_appointment') {
              const { date, time, notes } = args as { date: string; time: string; notes?: string }
              const appointmentTime = new Date(`${date}T${time}:00`)

              // Get customer info from call
              const customerNumber = body.call?.customer?.number || 'Unknown'
              const customerName = body.call?.assistantOverrides?.variableValues?.lead_name || 'Unknown'

              // Save to appointments table
              const { error } = await supabase
                .from('appointments')
                .insert({
                  lead_name: customerName,
                  lead_phone: customerNumber,
                  appointment_time: appointmentTime.toISOString(),
                  notes: notes || null
                })

              if (error) {
                console.error('Appointment save error:', error)
                return {
                  toolCallId: toolCall.id,
                  result: JSON.stringify({ success: false, message: 'Failed to book' })
                }
              }

              return {
                toolCallId: toolCall.id,
                result: JSON.stringify({
                  success: true,
                  message: `Appointment confirmed for ${date} at ${time}`
                })
              }
            }

            return {
              toolCallId: toolCall.id,
              result: JSON.stringify({ error: 'Unknown tool' })
            }
          })
        )

        return NextResponse.json({ results })
      }

      case 'end-of-call-report': {
        console.log('Call ended:', body.call?.id)
        return NextResponse.json({ received: true })
      }

      default:
        return NextResponse.json({ received: true })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
