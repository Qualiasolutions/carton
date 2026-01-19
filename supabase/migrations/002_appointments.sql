-- Appointments table (booked by Sophie during calls)
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  lead_name text not null,
  lead_phone text not null,
  appointment_time timestamptz not null,
  duration_minutes int default 30,
  notes text,
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_appointments_time on appointments(appointment_time);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_appointments_created on appointments(created_at desc);

-- Updated_at trigger
create trigger appointments_updated_at
  before update on appointments
  for each row
  execute function update_updated_at();

-- Enable realtime for appointments
alter publication supabase_realtime add table appointments;
