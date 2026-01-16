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
- [x] Push to GitHub
- [x] Deploy to Vercel
- [x] Create Supabase project (klwtrlkwkzakotckvhac)
- [x] Apply database migration
- [x] Set VAPI webhook URL on assistant
- [x] Configure Vercel env vars

## Success Criteria

- [ ] Can sync leads from GoHighLevel
- [ ] Dashboard shows leads with status
- [ ] Click "Call" triggers VAPI outbound to UK number
- [ ] Call events update lead status in real-time
- [ ] Transcript visible after call ends
- [ ] Appointment booking works via voice

---

**Created:** 2026-01-16
**Status:** Deployed - Demo Mode Active

## Configuration Summary

**Live URLs:**
- Dashboard: https://carton-neon.vercel.app
- GitHub: https://github.com/Qualiasolutions/carton

**Supabase Project:** `klwtrlkwkzakotckvhac`
- URL: https://klwtrlkwkzakotckvhac.supabase.co
- Dashboard: https://supabase.com/dashboard/project/klwtrlkwkzakotckvhac

**VAPI Assistant:** `b156dc91-38ea-48f0-927c-e6401b565807`
- Webhook URL: https://carton-neon.vercel.app/api/vapi/webhook
- Phone Number: +442039856195 (UK)

**Manual Steps Required:**
1. Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard → Settings → API → service_role key
2. Update in Vercel: `vercel env add SUPABASE_SERVICE_ROLE_KEY production --force`
3. Add GoHighLevel credentials when ready:
   - `GHL_API_KEY` - Your GHL API key
   - `GHL_LOCATION_ID` - Your GHL location ID
4. Redeploy: `vercel --prod`
