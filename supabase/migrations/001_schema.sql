-- Carton: Voice AI Lead Follow-up System
-- Database Schema

-- leads (synced from GoHighLevel)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  ghl_contact_id text unique,
  name text not null,
  phone text not null,
  email text,
  status text default 'new' check (status in ('new', 'calling', 'called', 'booked', 'lost')),
  appointment_time timestamptz,
  notes text,
  ghl_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- calls (VAPI call records)
create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  vapi_call_id text unique,
  status text default 'pending' check (status in ('pending', 'in-progress', 'completed', 'failed')),
  transcript text,
  summary text,
  duration_seconds int,
  ended_reason text,
  cost decimal(10,4),
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_ghl_id on leads(ghl_contact_id);
create index if not exists idx_leads_created on leads(created_at desc);
create index if not exists idx_calls_lead on calls(lead_id);
create index if not exists idx_calls_vapi on calls(vapi_call_id);
create index if not exists idx_calls_created on calls(created_at desc);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row
  execute function update_updated_at();

-- Enable realtime
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table calls;
