export interface Patron {
  id: string;
  tessitura_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  patron_id: string;
  tessitura_ticket_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  seat_section?: string;
  seat_row?: string;
  seat_number?: string;
  ticket_type: string;
  qr_code_data?: string;
  status: 'active' | 'used' | 'transferred' | 'cancelled';
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  patron_id: string;
  tessitura_donation_id: string;
  amount: number;
  currency: string;
  campaign_name?: string;
  designation?: string;
  is_recurring: boolean;
  frequency?: string;
  tax_receipt_number?: string;
  tax_receipt_issued_at?: string;
  donation_date: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  patron_id: string;
  tessitura_subscription_id: string;
  subscription_name: string;
  season: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  seat_preference?: Record<string, any>;
  total_performances: number;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  patron_id: string;
  tessitura_membership_id: string;
  tier: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  benefits?: any[];
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  patron_id: string;
  tessitura_payment_id?: string;
  type: 'credit_card' | 'debit_card' | 'bank_account';
  last_four: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  billing_address?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: string;
  patron_id: string;
  agent_id?: string;
  status: 'open' | 'closed' | 'waiting';
  subject?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'patron' | 'agent';
  sender_id: string;
  message: string;
  attachments?: any[];
  read_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  patron_id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read_at?: string;
  deep_link?: string;
  created_at: string;
}
