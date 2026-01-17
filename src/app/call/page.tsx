'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Phone, PhoneOff, Loader2, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]"
        />
      </div>

      {/* Header */}
      <header className="relative shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/50 blur-xl rounded-full" />
              <Image
                src="/logo.svg"
                alt="Concept Carton"
                width={140}
                height={32}
                priority
                className="relative brightness-0 invert sm:w-[180px]"
              />
            </div>
            <div className="hidden sm:block h-6 w-px bg-white/20" />
            <span className="hidden sm:block text-xs font-medium text-emerald-400/80 tracking-wider uppercase">Voice AI</span>
          </div>
          <nav className="flex items-center gap-2">
            <a href="/" className="px-3 sm:px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              Calendar
            </a>
            <a
              href="/call"
              className="group relative px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-90" />
              <span className="relative flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call Sophie</span>
                <span className="sm:hidden">Call</span>
              </span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 sm:space-y-8 max-w-md"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-2 sm:mb-4"
            >
              Talk to <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Sophie</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/50 text-base sm:text-lg"
            >
              {status === 'idle' && 'Click to start a conversation'}
              {status === 'connecting' && 'Connecting...'}
              {status === 'connected' && 'Connected - speak now'}
              {status === 'error' && 'Connection failed'}
            </motion.p>
          </div>

          <div className="flex gap-4 sm:gap-6 justify-center items-center">
            {/* Main call button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isActive ? endCall : startCall}
              disabled={status === 'connecting'}
              className="relative group"
            >
              {/* Outer glow ring */}
              <div className={`absolute -inset-3 sm:-inset-4 rounded-full blur-xl transition-all duration-500 ${
                isActive
                  ? 'bg-red-500/40 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-cyan-500/40 group-hover:from-emerald-500/60 group-hover:via-teal-500/60 group-hover:to-cyan-500/60'
              }`} />

              {/* Button */}
              <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
              }`}>
                {/* Inner ring */}
                <div className="absolute inset-1.5 sm:inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />

                <AnimatePresence mode="wait">
                  {status === 'connecting' ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: 0 }}
                      animate={{ opacity: 1, rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                    >
                      <Loader2 className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      key="end"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <PhoneOff className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Phone className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>

            {/* Mute button */}
            <AnimatePresence>
              {status === 'connected' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: -20 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  className="relative group"
                >
                  <div className={`absolute -inset-2 rounded-full blur-lg transition-all ${
                    isMuted ? 'bg-red-500/40' : 'bg-white/20 group-hover:bg-white/30'
                  }`} />
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                    isMuted
                      ? 'bg-red-500/20 border-red-500/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}>
                    {isMuted ? (
                      <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                    ) : (
                      <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    )}
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Voice visualizer when connected */}
          <AnimatePresence>
            {status === 'connected' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex justify-center gap-1 h-12"
              >
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [12, Math.random() * 40 + 8, 12],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.1,
                    }}
                    className="w-1.5 bg-gradient-to-t from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <span className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-emerald-500 animate-pulse' :
              status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              status === 'error' ? 'bg-red-500' :
              'bg-white/30'
            }`} />
            <span className="text-white/40">
              {status === 'connected' ? 'Call in progress' :
               status === 'connecting' ? 'Establishing connection' :
               status === 'error' ? 'Call failed' :
               'Ready to call'}
            </span>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative shrink-0 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <p className="text-white/30 text-xs sm:text-sm">Concept Carton</p>
          <div className="flex items-center gap-2 text-white/30 text-xs sm:text-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Powered by VAPI
          </div>
        </div>
      </footer>
    </div>
  )
}
