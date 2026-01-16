'use client'

import { useState, useEffect } from 'react'
import { Phone, PhoneOff, Loader2, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Vapi from '@vapi-ai/web'

const ASSISTANT_ID = 'b156dc91-38ea-48f0-927c-e6401b565807'

export default function CallPage() {
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    if (!publicKey) {
      setError('VAPI public key not configured')
      return
    }

    const vapiInstance = new Vapi(publicKey)

    vapiInstance.on('call-start', () => {
      setStatus('connected')
    })

    vapiInstance.on('call-end', () => {
      setStatus('idle')
    })

    vapiInstance.on('error', (e) => {
      console.error('VAPI error:', e)
      setError(e.message || 'Call failed')
      setStatus('error')
    })

    setVapi(vapiInstance)

    return () => {
      vapiInstance.stop()
    }
  }, [])

  const startCall = async () => {
    if (!vapi) return

    setStatus('connecting')
    setError(null)

    try {
      await vapi.start(ASSISTANT_ID)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call')
      setStatus('error')
    }
  }

  const endCall = () => {
    if (!vapi) return
    vapi.stop()
    setStatus('idle')
  }

  const toggleMute = () => {
    if (!vapi) return
    vapi.setMuted(!isMuted)
    setIsMuted(!isMuted)
  }

  const isActive = status === 'connecting' || status === 'connected'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">Talk to Sophie</h1>
        <p className="text-muted-foreground">
          {status === 'idle' && 'Click to start a conversation'}
          {status === 'connecting' && 'Connecting...'}
          {status === 'connected' && 'Connected - speak now'}
          {status === 'error' && 'Connection failed'}
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className={`w-32 h-32 rounded-full text-2xl ${isActive ? 'bg-red-500 hover:bg-red-600' : ''}`}
            onClick={isActive ? endCall : startCall}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : isActive ? (
              <PhoneOff className="w-12 h-12" />
            ) : (
              <Phone className="w-12 h-12" />
            )}
          </Button>

          {status === 'connected' && (
            <Button
              size="lg"
              variant={isMuted ? 'destructive' : 'outline'}
              className="w-20 h-20 rounded-full"
              onClick={toggleMute}
            >
              {isMuted ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          )}
        </div>

        {error && (
          <p className="text-red-500">{error}</p>
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
