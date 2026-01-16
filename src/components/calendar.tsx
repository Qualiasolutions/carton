'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Phone, Clock, User, Calendar as CalendarIcon } from 'lucide-react'

interface Appointment {
  id: string
  lead_name: string
  lead_phone: string
  appointment_time: string
  duration_minutes: number
  notes: string | null
  status: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_time)
      return aptDate.toDateString() === date.toDateString()
    })
  }

  const prevMonth = () => {
    setDirection(-1)
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setDirection(1)
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)
  const today = new Date()
  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2 relative group"
      >
        {/* Glass card with animated border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-cyan-500/50 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentDate.toISOString()}
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  className="text-2xl font-bold text-white"
                >
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </motion.h2>
              </AnimatePresence>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevMonth}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextMonth}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-white/40 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDate.toISOString()}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-7 gap-1"
            >
              {/* Empty cells */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const isToday = date.toDateString() === today.toDateString()
                const isSelected = selectedDate?.toDateString() === date.toDateString()
                const dayAppointments = getAppointmentsForDate(date)
                const hasAppointments = dayAppointments.length > 0

                return (
                  <motion.button
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-1 rounded-xl text-sm font-medium transition-all relative
                      ${isToday ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'text-white/70 hover:bg-white/10 hover:text-white'}
                      ${isSelected ? 'ring-2 ring-cyan-400 bg-cyan-500/20 text-cyan-300' : ''}
                    `}
                  >
                    <span className="relative z-10">{day}</span>
                    {hasAppointments && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"
                      >
                        {dayAppointments.slice(0, 3).map((_, idx) => (
                          <span key={idx} className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                        ))}
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Appointments Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative group"
      >
        <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate?.toISOString() || 'none'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-bold text-white text-lg mb-4">
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Select a date'}
              </h3>

              {selectedDate && selectedAppointments.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-white/30" />
                  </div>
                  <p className="text-white/40 text-sm">No appointments</p>
                </div>
              )}

              <div className="space-y-3">
                {selectedAppointments.map((apt, idx) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-white">{apt.lead_name}</span>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {apt.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-white/60">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        {new Date(apt.appointment_time).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        <span className="text-white/40">({apt.duration_minutes} min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        {apt.lead_phone}
                      </div>
                    </div>
                    {apt.notes && (
                      <p className="mt-3 text-sm text-white/40 italic">{apt.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Upcoming appointments */}
          {!selectedDate && appointments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Upcoming</h4>
              <div className="space-y-2">
                {appointments
                  .filter(apt => new Date(apt.appointment_time) >= today)
                  .slice(0, 5)
                  .map((apt, idx) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
                      onClick={() => setSelectedDate(new Date(apt.appointment_time))}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-white text-sm">{apt.lead_name}</span>
                        <span className="text-xs text-emerald-400">
                          {new Date(apt.appointment_time).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {new Date(apt.appointment_time).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {appointments.length === 0 && !selectedDate && (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center"
              >
                <CalendarIcon className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <p className="text-white/50 text-sm">No appointments yet</p>
              <p className="text-white/30 text-xs mt-1">Sophie will book during calls</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
