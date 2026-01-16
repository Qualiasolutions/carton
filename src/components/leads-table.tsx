'use client'

import { useState } from 'react'
import { Phone, RefreshCw, Loader2, Calendar, X, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Lead, Call } from '@/lib/supabase'

interface LeadWithCalls extends Lead {
  calls: Call[]
}

interface LeadsTableProps {
  initialLeads: LeadWithCalls[]
}

const statusConfig: Record<Lead['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  new: { label: 'New', variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
  calling: { label: 'Calling', variant: 'default', icon: <Phone className="w-3 h-3 animate-pulse" /> },
  called: { label: 'Called', variant: 'outline', icon: <CheckCircle2 className="w-3 h-3" /> },
  booked: { label: 'Booked', variant: 'default', icon: <Calendar className="w-3 h-3" /> },
  lost: { label: 'Not Interested', variant: 'destructive', icon: <X className="w-3 h-3" /> },
}

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState<LeadWithCalls[]>(initialLeads)
  const [loading, setLoading] = useState(false)
  const [callingLead, setCallingLead] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadWithCalls | null>(null)

  const syncLeads = async () => {
    setLoading(true)
    try {
      // First sync from GHL
      const syncRes = await fetch('/api/ghl/sync', { method: 'POST' })
      if (!syncRes.ok) {
        const error = await syncRes.json()
        throw new Error(error.error || 'Sync failed')
      }

      // Then fetch updated leads
      const res = await fetch('/api/ghl/sync')
      const data = await res.json()
      setLeads(data.leads || [])
      toast.success('Leads synced successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sync leads')
    } finally {
      setLoading(false)
    }
  }

  const syncDemo = async () => {
    setLoading(true)
    try {
      const syncRes = await fetch('/api/demo/sync', { method: 'POST' })
      if (!syncRes.ok) {
        const error = await syncRes.json()
        throw new Error(error.error || 'Demo sync failed')
      }

      const syncData = await syncRes.json()
      toast.success(`Added ${syncData.synced} demo leads`)

      // Refresh leads list
      const res = await fetch('/api/ghl/sync')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sync demo')
    } finally {
      setLoading(false)
    }
  }

  const refreshLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ghl/sync')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch {
      toast.error('Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  const triggerCall = async (leadId: string) => {
    setCallingLead(leadId)
    try {
      const res = await fetch('/api/calls/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start call')
      }

      toast.success('Call initiated!')
      // Refresh to see updated status
      setTimeout(refreshLeads, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start call')
    } finally {
      setCallingLead(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {leads.length} leads from GoHighLevel
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshLeads}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={syncDemo}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sync Demo
            </Button>
            <Button
              size="sm"
              onClick={syncLeads}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sync from GHL
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {(['new', 'calling', 'called', 'booked', 'lost'] as const).map((status) => {
            const count = leads.filter(l => l.status === status).length
            const config = statusConfig[status]
            return (
              <div
                key={status}
                className="bg-card border rounded-lg p-4 space-y-1"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  {config.icon}
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {config.label}
                  </span>
                </div>
                <p className="text-2xl font-semibold">{count}</p>
              </div>
            )
          })}
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Call</TableHead>
                <TableHead className="w-[100px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No leads yet. Click &quot;Sync from GHL&quot; to import leads.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const config = statusConfig[lead.status]
                  const lastCall = lead.calls?.[0]
                  const isCallDisabled = lead.status === 'calling' || lead.status === 'booked'

                  return (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.email || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {lastCall ? formatDate(lastCall.created_at) : '—'}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant={isCallDisabled ? 'outline' : 'default'}
                          disabled={isCallDisabled || callingLead === lead.id}
                          onClick={() => triggerCall(lead.id)}
                        >
                          {callingLead === lead.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedLead?.name}</DialogTitle>
            <DialogDescription>Lead details and call history</DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              {/* Lead Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-mono">{selectedLead.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p>{selectedLead.email || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1">
                    <Badge variant={statusConfig[selectedLead.status].variant}>
                      {statusConfig[selectedLead.status].label}
                    </Badge>
                  </div>
                </div>
                {selectedLead.appointment_time && (
                  <div>
                    <span className="text-muted-foreground">Appointment</span>
                    <p>{formatDate(selectedLead.appointment_time)}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Notes</span>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedLead.notes}</p>
                </div>
              )}

              {/* Call History */}
              <div>
                <h4 className="text-sm font-medium mb-3">Call History</h4>
                {selectedLead.calls?.length ? (
                  <div className="space-y-3">
                    {selectedLead.calls.map((call) => (
                      <div
                        key={call.id}
                        className="p-3 border rounded-lg text-sm space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{call.status}</Badge>
                          <span className="text-muted-foreground">
                            {formatDate(call.created_at)}
                          </span>
                        </div>
                        {call.duration_seconds && (
                          <p className="text-muted-foreground">
                            Duration: {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                          </p>
                        )}
                        {call.summary && (
                          <p className="text-muted-foreground">{call.summary}</p>
                        )}
                        {call.transcript && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View Transcript
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                              {call.transcript}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No calls yet</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLead(null)}
                >
                  Close
                </Button>
                <Button
                  disabled={selectedLead.status === 'calling' || selectedLead.status === 'booked' || callingLead === selectedLead.id}
                  onClick={() => {
                    triggerCall(selectedLead.id)
                    setSelectedLead(null)
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
