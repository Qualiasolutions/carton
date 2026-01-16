# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Carton** - Voice AI Lead Follow-up System for Medical Practices.

**Client:** Concept Carton (UK Marketing Agency)
**Problem:** Medical practices don't follow up with 40-50% of leads
**Solution:** AI voice agent that calls leads and books appointments

---

## Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 + React 19 + Tailwind + shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Edge Functions) |
| **Voice AI** | VAPI + ElevenLabs TTS + Deepgram Nova-3 |
| **CRM Source** | GoHighLevel |
| **Deployment** | Vercel |

---

## VAPI Configuration

**Assistant ID:** `b156dc91-38ea-48f0-927c-e6401b565807`
**Name:** Sophie - Medical Lead Follow-up

---

## Key Commands

```bash
# Development
npm run dev

# Build
npm run build

# Database Migration
# Run 001_schema.sql in Supabase SQL editor
```

---

## Environment Variables

See `.env.example` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `VAPI_PRIVATE_KEY` / `NEXT_PUBLIC_VAPI_PUBLIC_KEY` / `VAPI_ASSISTANT_ID` / `VAPI_PHONE_NUMBER_ID`
- `GHL_API_KEY` / `GHL_LOCATION_ID`

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/vapi/webhook` | POST | VAPI webhook handler (call events, tools) |
| `/api/ghl/sync` | POST | Sync leads from GoHighLevel |
| `/api/ghl/sync` | GET | Fetch current leads |
| `/api/calls/trigger` | POST | Trigger outbound call to lead |

---

## Database Schema

**Tables:**
- `leads` - Contacts synced from GoHighLevel
- `calls` - VAPI call records with transcripts

See `supabase/migrations/001_schema.sql` for full schema.
