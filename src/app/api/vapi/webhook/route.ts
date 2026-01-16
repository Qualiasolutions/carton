import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// VAPI Webhook Handler
// Receives call events and tool calls from VAPI

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    console.log('VAPI Webhook:', JSON.stringify(body, null, 2))

    const messageType = body.message?.type

    switch (messageType) {
      case 'status-update': {
        // Call status changed
        const { call } = body
        const status = call.status === 'in-progress' ? 'in-progress' :
                       call.status === 'ended' ? 'completed' : 'pending'

        await supabase
          .from('calls')
          .update({ status })
          .eq('vapi_call_id', call.id)

        // Also update lead status
        const { data: callData } = await supabase
          .from('calls')
          .select('lead_id')
          .eq('vapi_call_id', call.id)
          .single()

        if (callData?.lead_id) {
          const leadStatus = status === 'in-progress' ? 'calling' :
                            status === 'completed' ? 'called' : 'new'
          await supabase
            .from('leads')
            .update({ status: leadStatus })
            .eq('id', callData.lead_id)
        }

        return NextResponse.json({ received: true })
      }

      case 'end-of-call-report': {
        // Call ended with full report
        const { call, message } = body

        await supabase
          .from('calls')
          .update({
            status: 'completed',
            transcript: message.transcript,
            summary: message.summary,
            duration_seconds: message.durationSeconds,
            ended_reason: message.endedReason,
            cost: message.cost
          })
          .eq('vapi_call_id', call.id)

        return NextResponse.json({ received: true })
      }

      case 'tool-calls': {
        // Handle tool calls from the assistant
        const results = await Promise.all(
          body.message.toolCalls.map(async (toolCall: { id: string; function: { name: string; arguments: Record<string, unknown> } }) => {
            const { name, arguments: args } = toolCall.function

            switch (name) {
              case 'book_appointment': {
                // Get lead from call
                const { data: callData } = await supabase
                  .from('calls')
                  .select('lead_id')
                  .eq('vapi_call_id', body.call.id)
                  .single()

                if (callData?.lead_id) {
                  // Update lead with appointment
                  await supabase
                    .from('leads')
                    .update({
                      status: 'booked',
                      appointment_time: args.datetime as string,
                      notes: args.notes as string || null
                    })
                    .eq('id', callData.lead_id)

                  return {
                    toolCallId: toolCall.id,
                    result: JSON.stringify({
                      success: true,
                      message: `Appointment booked for ${args.datetime}`
                    })
                  }
                }

                return {
                  toolCallId: toolCall.id,
                  result: JSON.stringify({ success: false, message: 'Lead not found' })
                }
              }

              case 'mark_not_interested': {
                const { data: callData } = await supabase
                  .from('calls')
                  .select('lead_id')
                  .eq('vapi_call_id', body.call.id)
                  .single()

                if (callData?.lead_id) {
                  await supabase
                    .from('leads')
                    .update({ status: 'lost', notes: args.reason as string || 'Not interested' })
                    .eq('id', callData.lead_id)
                }

                return {
                  toolCallId: toolCall.id,
                  result: JSON.stringify({ success: true, message: 'Lead marked as not interested' })
                }
              }

              default:
                return {
                  toolCallId: toolCall.id,
                  result: JSON.stringify({ error: 'Unknown tool' })
                }
            }
          })
        )

        return NextResponse.json({ results })
      }

      default:
        return NextResponse.json({ received: true })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
