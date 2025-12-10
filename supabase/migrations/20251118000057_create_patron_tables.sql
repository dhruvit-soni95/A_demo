/*
  # Calgary Opera Patron Database Schema

  ## Overview
  This migration creates the complete database schema for the Calgary Opera patron mobile app,
  including tables for patrons, tickets, donations, subscriptions, payments, chat, and notifications.

  ## New Tables

  ### patrons
  - `id` (uuid, primary key) - Internal Supabase user ID
  - `tessitura_id` (text, unique) - Patron ID from Tessitura system
  - `email` (text, unique) - Patron email address
  - `first_name` (text) - Patron first name
  - `last_name` (text) - Patron last name
  - `phone` (text) - Patron phone number
  - `address_line1` (text) - Street address
  - `address_line2` (text) - Apartment/suite number
  - `city` (text) - City
  - `province` (text) - Province/state
  - `postal_code` (text) - Postal/zip code
  - `country` (text) - Country
  - `preferences` (jsonb) - Patron preferences and settings
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### tickets
  - `id` (uuid, primary key) - Internal ticket ID
  - `patron_id` (uuid, foreign key) - Reference to patrons table
  - `tessitura_ticket_id` (text, unique) - Ticket ID from Tessitura
  - `event_name` (text) - Name of the performance/event
  - `event_date` (timestamptz) - Date and time of event
  - `venue_name` (text) - Venue name
  - `seat_section` (text) - Seat section
  - `seat_row` (text) - Seat row
  - `seat_number` (text) - Seat number
  - `ticket_type` (text) - Type of ticket (single, subscription, etc)
  - `qr_code_data` (text) - QR code data for scanning
  - `status` (text) - Status: active, used, transferred, cancelled
  - `purchase_date` (timestamptz) - Purchase timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### donations
  - `id` (uuid, primary key) - Internal donation ID
  - `patron_id` (uuid, foreign key) - Reference to patrons table
  - `tessitura_donation_id` (text, unique) - Donation ID from Tessitura
  - `amount` (numeric) - Donation amount
  - `currency` (text) - Currency code (CAD, USD, etc)
  - `campaign_name` (text) - Campaign or fund name
  - `designation` (text) - Specific designation for donation
  - `is_recurring` (boolean) - Whether donation is recurring
  - `frequency` (text) - Frequency for recurring donations
  - `tax_receipt_number` (text) - Tax receipt number
  - `tax_receipt_issued_at` (timestamptz) - Tax receipt issue date
  - `donation_date` (timestamptz) - Donation timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### subscriptions
  - `id` (uuid, primary key) - Internal subscription ID
  - `patron_id` (uuid, foreign key) - Reference to patrons table
  - `tessitura_subscription_id` (text, unique) - Subscription ID from Tessitura
  - `subscription_name` (text) - Name of subscription package
  - `season` (text) - Season year (e.g., "2024-2025")
  - `status` (text) - Status: active, expired, cancelled
  - `start_date` (timestamptz) - Subscription start date
  - `end_date` (timestamptz) - Subscription end date
  - `auto_renew` (boolean) - Whether subscription auto-renews
  - `seat_preference` (jsonb) - Seat location preferences
  - `total_performances` (integer) - Number of performances included
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### memberships
  - `id` (uuid, primary key) - Internal membership ID
  - `patron_id` (uuid, foreign key) - Reference to patrons table
  - `tessitura_membership_id` (text, unique) - Membership ID from Tessitura
  - `tier` (text) - Membership tier/level
  - `status` (text) - Status: active, expired, cancelled
  - `start_date` (timestamptz) - Membership start date
  - `end_date` (timestamptz) - Membership end date
  - `benefits` (jsonb) - List of membership benefits
  - `auto_renew` (boolean) - Whether membership auto-renews
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### payment_methods
  - `id` (uuid, primary key) - Internal payment method ID
  - `patron_id` (uuid, foreign key) - Reference to patrons table
  - `tessitura_payment_id` (text) - Payment method ID from Tessitura
  - `type` (text) - Type: credit_card, debit_card, bank_account
  - `last_four` (text) - Last 4 digits of card/account
  - `brand` (text) - Card brand (Visa, Mastercard, etc)
  - `expiry_month` (integer) - Card expiry month
  - `expiry_year` (integer) - Card expiry year
  - `is_default` (boolean) - Whether this is the default payment method
  - `billing_address` (jsonb) - Billing address details
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### chat_conversations
  - `id` (uuid, primary key) - Internal conversation ID
  - `patron_id` (uuid, foreign key) - Reference to patrons table
  - `agent_id` (text) - Agent ID assigned to conversation
  - `status` (text) - Status: open, closed, waiting
  - `subject` (text) - Conversation subject/topic
  - `created_at` (timestamptz) - Conversation start timestamp
  - `updated_at` (timestamptz) - Last message timestamp

  ### chat_messages
  - `id` (uuid, primary key) - Internal message ID
  - `conversation_id` (uuid, foreign key) - Reference to chat_conversations
  - `sender_type` (text) - Type: patron or agent
  - `sender_id` (uuid) - ID of sender (patron_id or agent_id)
  - `message` (text) - Message content
  - `attachments` (jsonb) - Array of attachment URLs
  - `read_at` (timestamptz) - When message was read
  - `created_at` (timestamptz) - Message timestamp

  ### notifications
  - `id` (uuid, primary key) - Internal notification ID
  - `patron_id` (uuid, foreign key) - Reference to patrons table
  - `type` (text) - Type: event_reminder, donation_receipt, chat_message, etc
  - `title` (text) - Notification title
  - `body` (text) - Notification body text
  - `data` (jsonb) - Additional data payload
  - `read_at` (timestamptz) - When notification was read
  - `deep_link` (text) - Deep link URL within app
  - `created_at` (timestamptz) - Notification timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Policies restrict access to authenticated users' own data
  - Chat agents can access conversations assigned to them
  - Admin users can access all data (for future admin panel)

  ## Indexes
  - Create indexes on foreign keys for performance
  - Create indexes on frequently queried fields (email, tessitura IDs, dates)
*/

-- Create patrons table
CREATE TABLE IF NOT EXISTS patrons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tessitura_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country text DEFAULT 'Canada',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patrons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own data"
  ON patrons FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Patrons can update own data"
  ON patrons FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES patrons(id) ON DELETE CASCADE NOT NULL,
  tessitura_ticket_id text UNIQUE NOT NULL,
  event_name text NOT NULL,
  event_date timestamptz NOT NULL,
  venue_name text NOT NULL,
  seat_section text,
  seat_row text,
  seat_number text,
  ticket_type text DEFAULT 'single',
  qr_code_data text,
  status text DEFAULT 'active',
  purchase_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (patron_id = auth.uid());

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES patrons(id) ON DELETE CASCADE NOT NULL,
  tessitura_donation_id text UNIQUE NOT NULL,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'CAD',
  campaign_name text,
  designation text,
  is_recurring boolean DEFAULT false,
  frequency text,
  tax_receipt_number text,
  tax_receipt_issued_at timestamptz,
  donation_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (patron_id = auth.uid());

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES patrons(id) ON DELETE CASCADE NOT NULL,
  tessitura_subscription_id text UNIQUE NOT NULL,
  subscription_name text NOT NULL,
  season text NOT NULL,
  status text DEFAULT 'active',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  auto_renew boolean DEFAULT false,
  seat_preference jsonb DEFAULT '{}'::jsonb,
  total_performances integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (patron_id = auth.uid());

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES patrons(id) ON DELETE CASCADE NOT NULL,
  tessitura_membership_id text UNIQUE NOT NULL,
  tier text NOT NULL,
  status text DEFAULT 'active',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  benefits jsonb DEFAULT '[]'::jsonb,
  auto_renew boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own memberships"
  ON memberships FOR SELECT
  TO authenticated
  USING (patron_id = auth.uid());

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES patrons(id) ON DELETE CASCADE NOT NULL,
  tessitura_payment_id text,
  type text NOT NULL,
  last_four text NOT NULL,
  brand text,
  expiry_month integer,
  expiry_year integer,
  is_default boolean DEFAULT false,
  billing_address jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (patron_id = auth.uid());

CREATE POLICY "Patrons can insert own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (patron_id = auth.uid());

CREATE POLICY "Patrons can update own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (patron_id = auth.uid())
  WITH CHECK (patron_id = auth.uid());

CREATE POLICY "Patrons can delete own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (patron_id = auth.uid());

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES patrons(id) ON DELETE CASCADE NOT NULL,
  agent_id text,
  status text DEFAULT 'open',
  subject text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own conversations"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (patron_id = auth.uid());

CREATE POLICY "Patrons can create conversations"
  ON chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (patron_id = auth.uid());

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages in their conversations"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.patron_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.patron_id = auth.uid()
    )
  );

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES patrons(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  deep_link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patrons can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (patron_id = auth.uid());

CREATE POLICY "Patrons can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (patron_id = auth.uid())
  WITH CHECK (patron_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patrons_tessitura_id ON patrons(tessitura_id);
CREATE INDEX IF NOT EXISTS idx_patrons_email ON patrons(email);
CREATE INDEX IF NOT EXISTS idx_tickets_patron_id ON tickets(patron_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_date ON tickets(event_date);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_donations_patron_id ON donations(patron_id);
CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_patron_id ON subscriptions(patron_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_memberships_patron_id ON memberships(patron_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_patron_id ON payment_methods(patron_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_patron_id ON chat_conversations(patron_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patron_id ON notifications(patron_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);