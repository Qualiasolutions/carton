import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Parse date string and ensure valid year (handles "January 20", "20/01", "2026-01-20", etc.)
function parseAppointmentDate(dateStr: string, timeStr: string): Date {
  const now = new Date()
  const currentYear = now.getFullYear()

  // Try parsing as full ISO date first
  let parsed = new Date(`${dateStr}T${timeStr}:00`)

  // If invalid or year is far in past, try to fix
  if (isNaN(parsed.getTime()) || parsed.getFullYear() < currentYear - 1) {
    // Try various formats
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                        'july', 'august', 'september', 'october', 'november', 'december']
    const lowerDate = dateStr.toLowerCase()

    // Check for month name (e.g., "January 20" or "20 January")
    for (let i = 0; i < monthNames.length; i++) {
      if (lowerDate.includes(monthNames[i])) {
        const dayMatch = dateStr.match(/\d+/)
        if (dayMatch) {
          const day = parseInt(dayMatch[0])
          const [hours, minutes] = timeStr.split(':').map(Number)
          parsed = new Date(currentYear, i, day, hours || 0, minutes || 0)
          // If date is in the past, assume next year
          if (parsed < now) {
            parsed = new Date(currentYear + 1, i, day, hours || 0, minutes || 0)
          }
          return parsed
        }
      }
    }

    // Try DD/MM or MM/DD format
    const slashMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})/)
    if (slashMatch) {
      const [, first, second] = slashMatch
      const [hours, minutes] = timeStr.split(':').map(Number)
      // Assume DD/MM for UK
      const day = parseInt(first)
      const month = parseInt(second) - 1
      parsed = new Date(currentYear, month, day, hours || 0, minutes || 0)
      if (parsed < now) {
        parsed = new Date(currentYear + 1, month, day, hours || 0, minutes || 0)
      }
      return parsed
    }

    // Last resort: use current year with original parse
    const [hours, minutes] = timeStr.split(':').map(Number)
    const monthDay = new Date(dateStr)
    if (!isNaN(monthDay.getTime())) {
      parsed = new Date(currentYear, monthDay.getMonth(), monthDay.getDate(), hours || 0, minutes || 0)
      if (parsed < now) {
        parsed = new Date(currentYear + 1, monthDay.getMonth(), monthDay.getDate(), hours || 0, minutes || 0)
      }
    }
  }

  return parsed
}

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
              const { customer_name, date, time, notes } = args as { customer_name: string; date: string; time: string; notes?: string }

              // Parse date with year handling
              const appointmentTime = parseAppointmentDate(date, time)

              // Validate the parsed date
              if (isNaN(appointmentTime.getTime())) {
                console.error('Invalid date parsed:', { date, time })
                return {
                  toolCallId: toolCall.id,
                  result: JSON.stringify({ success: false, message: 'Could not parse the date. Please try again with a clearer date.' })
                }
              }

              // Get customer phone from call
              const customerNumber = body.call?.customer?.number || 'Unknown'

              // Save to appointments table
              const { error } = await supabase
                .from('appointments')
                .insert({
                  lead_name: customer_name || 'Unknown',
                  lead_phone: customerNumber,
                  appointment_time: appointmentTime.toISOString(),
                  notes: notes || null
                })

              if (error) {
                console.error('Appointment save error:', error)
                return {
                  toolCallId: toolCall.id,
                  result: JSON.stringify({ success: false, message: 'Failed to book appointment' })
                }
              }

              const formattedDate = appointmentTime.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
              const formattedTime = appointmentTime.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })

              return {
                toolCallId: toolCall.id,
                result: JSON.stringify({
                  success: true,
                  message: `Appointment confirmed for ${customer_name} on ${formattedDate} at ${formattedTime}`
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
