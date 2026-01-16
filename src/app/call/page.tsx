'use client'

import { useState } from 'react'
import { Phone, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CallPage() {
  const [status, setStatus] = useState<'idle' | 'calling' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const triggerCall = async () => {
    setStatus('calling')
    setError(null)

    try {
      const res = await fetch('/api/calls/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: 'quick-call', leadName: 'Demo' })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start call')
      }

      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call failed')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">Quick Call</h1>
        <p className="text-muted-foreground">
          Ring the demo number (+447920274763) instantly
        </p>

        <Button
          size="lg"
          className="w-48 h-48 rounded-full text-2xl"
          onClick={triggerCall}
          disabled={status === 'calling'}
        >
          {status === 'calling' ? (
            <Loader2 className="w-16 h-16 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 className="w-16 h-16" />
          ) : (
            <Phone className="w-16 h-16" />
          )}
        </Button>

        {status === 'success' && (
          <p className="text-green-500 font-medium">Call initiated!</p>
        )}

        {status === 'error' && (
          <p className="text-red-500">{error}</p>
        )}

        {status === 'success' && (
          <Button variant="outline" onClick={() => setStatus('idle')}>
            Call Again
          </Button>
        )}

        <div className="pt-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
