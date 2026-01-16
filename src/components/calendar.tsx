'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Phone, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)
  const today = new Date()

  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-card border rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const isToday = date.toDateString() === today.toDateString()
            const isSelected = selectedDate?.toDateString() === date.toDateString()
            const dayAppointments = getAppointmentsForDate(date)
            const hasAppointments = dayAppointments.length > 0

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square p-1 rounded-lg text-sm transition-all relative
                  hover:bg-muted
                  ${isToday ? 'bg-primary/10 font-bold' : ''}
                  ${isSelected ? 'ring-2 ring-primary bg-primary/20' : ''}
                `}
              >
                <span className={isToday ? 'text-primary' : ''}>{day}</span>
                {hasAppointments && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayAppointments.slice(0, 3).map((_, idx) => (
                      <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Appointments Panel */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">
          {selectedDate
            ? selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
            : 'Select a date'}
        </h3>

        {selectedDate && selectedAppointments.length === 0 && (
          <p className="text-muted-foreground text-sm">No appointments scheduled</p>
        )}

        <div className="space-y-3">
          {selectedAppointments.map(apt => (
            <div key={apt.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{apt.lead_name}</span>
                </div>
                <Badge variant="outline">{apt.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(apt.appointment_time).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                <span>({apt.duration_minutes} min)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                {apt.lead_phone}
              </div>
              {apt.notes && (
                <p className="text-sm text-muted-foreground mt-2">{apt.notes}</p>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming appointments */}
        {!selectedDate && appointments.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-muted-foreground mt-6 mb-3">Upcoming</h4>
            <div className="space-y-3">
              {appointments
                .filter(apt => new Date(apt.appointment_time) >= today)
                .slice(0, 5)
                .map(apt => (
                  <div key={apt.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{apt.lead_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(apt.appointment_time).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(apt.appointment_time).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}

        {appointments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No appointments yet</p>
            <p className="text-xs mt-1">Sophie will book appointments during calls</p>
          </div>
        )}
      </div>
    </div>
  )
}
