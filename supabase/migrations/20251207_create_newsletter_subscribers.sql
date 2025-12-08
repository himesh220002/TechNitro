-- Create a table for newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Enable Row Level Security (RLS)
alter table newsletter_subscribers enable row level security;

-- Create a policy that allows anyone to insert (subscribe)
create policy "Enable insert for everyone" on newsletter_subscribers
  for insert with check (true);

-- Create a policy that allows only admins to view subscribers
-- (Assuming you have an admin role or similar, for now we'll restrict to authenticated users or service role)
-- For simplicity in this project context where we use the service role in API routes, this is fine.
create policy "Enable read access for authenticated users only" on newsletter_subscribers
  for select using (auth.role() = 'authenticated');
