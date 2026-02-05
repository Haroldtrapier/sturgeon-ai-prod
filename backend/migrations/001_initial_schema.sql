-- Phase 2: Supabase Schema for Sturgeon AI
-- Run this in Supabase SQL Editor

-- Users table (extends auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text default 'free',
  created_at timestamp default now()
);

-- Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  title text,
  created_at timestamp default now()
);

-- Messages table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text,
  agent text,
  content text,
  created_at timestamp default now()
);

-- Subscriptions table (Stripe integration)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  plan text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table subscriptions enable row level security;

-- Policies for users (can read/update own data)
create policy "Users can read own data" on users
  for select using (auth.uid() = id);

create policy "Users can update own data" on users
  for update using (auth.uid() = id);

-- Policies for conversations
create policy "Users can read own conversations" on conversations
  for select using (auth.uid() = user_id);

create policy "Users can create conversations" on conversations
  for insert with check (auth.uid() = user_id);

-- Policies for messages
create policy "Users can read own messages" on messages
  for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages" on messages
  for insert with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Policies for subscriptions
create policy "Users can read own subscriptions" on subscriptions
  for select using (auth.uid() = user_id);
