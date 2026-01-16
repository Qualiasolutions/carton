# Carton - Voice AI Lead Follow-up System (MVP)

## Overview

Voice AI system for Concept Carton that:
1. **Fetches leads from GoHighLevel CRM**
2. **Displays leads in a dashboard**
3. **Triggers outbound calls via VAPI + Vonage to UK numbers**
4. **Tracks call outcomes and appointments**

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   GoHighLevel   │─────▶│   Carton App    │─────▶│      VAPI       │
│   (Lead Source) │      │   (Dashboard)   │      │ (Voice + Vonage)│
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │                         │
                                ▼                         │
                         ┌─────────────────┐              │
                         │    Supabase     │◀─────────────┘
                         │   (Database)    │   (Webhooks)
                         └─────────────────┘
```

## Implementation Status

- [x] Initialize Next.js 15 project
- [x] Install dependencies (Supabase, shadcn/ui)
- [x] Create database schema
- [x] Build dashboard UI
- [x] Create VAPI webhook handler
- [x] Create GHL sync endpoint
- [x] Create call trigger endpoint
- [x] Configure environment variables
- [ ] Push to GitHub
- [ ] Deploy to Vercel

## Success Criteria

- [ ] Can sync leads from GoHighLevel
- [ ] Dashboard shows leads with status
- [ ] Click "Call" triggers VAPI outbound to UK number
- [ ] Call events update lead status in real-time
- [ ] Transcript visible after call ends
- [ ] Appointment booking works via voice

---

**Created:** 2026-01-16
**Status:** Implementation Complete - Pending Deployment
