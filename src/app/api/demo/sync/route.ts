import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const FIRST_NAMES = ['Emma', 'Oliver', 'Charlotte', 'James', 'Sophia', 'William', 'Amelia', 'George', 'Isabella', 'Harry', 'Mia', 'Jack', 'Ava', 'Noah', 'Emily', 'Leo', 'Grace', 'Oscar', 'Lily', 'Charlie']
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis']
const INTERESTS = ['Botox consultation', 'Dermal fillers inquiry', 'Skin rejuvenation', 'Anti-aging treatment', 'Cosmetic consultation', 'Facial aesthetics', 'Lip enhancement', 'Skin care advice', null]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateUKPhone(): string {
  const prefixes = ['7700', '7800', '7900', '7911', '7922', '7933', '7944', '7955']
  const prefix = randomItem(prefixes)
  const number = Math.floor(Math.random() * 900000 + 100000)
  return `+44${prefix}${number}`
}

function generateEmail(first: string, last: string): string | null {
  if (Math.random() > 0.7) return null
  const domains = ['gmail.com', 'outlook.com', 'yahoo.co.uk', 'hotmail.com', 'icloud.com']
  return `${first.toLowerCase()}.${last.toLowerCase()}@${randomItem(domains)}`
}

export async function POST() {
  try {
    const supabase = createServerClient()
    const count = Math.floor(Math.random() * 4) + 3 // 3-6 leads

    const leads = Array.from({ length: count }, () => {
      const firstName = randomItem(FIRST_NAMES)
      const lastName = randomItem(LAST_NAMES)
      return {
        ghl_contact_id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: `${firstName} ${lastName}`,
        phone: generateUKPhone(),
        email: generateEmail(firstName, lastName),
        status: 'new' as const,
        notes: randomItem(INTERESTS),
        ghl_data: { source: 'demo', createdAt: new Date().toISOString() }
      }
    })

    const { data, error } = await supabase
      .from('leads')
      .insert(leads)
      .select()

    if (error) {
      console.error('Demo sync error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      synced: data?.length || 0,
      leads: data
    })

  } catch (error) {
    console.error('Demo sync error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Demo sync failed'
    }, { status: 500 })
  }
}
