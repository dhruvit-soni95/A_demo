export interface TessituraAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface TessituraPatron {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses?: TessituraAddress[];
  preferences?: Record<string, any>;
}

export interface TessituraAddress {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface TessituraEvent {
  id: string;
  name: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  venueName: string;
  venueId: string;
  performanceType: string;
  priceRanges?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface TessituraTicket {
  id: string;
  eventId: string;
  eventName: string;
  performanceDate: string;
  seatSection: string;
  seatRow: string;
  seatNumber: string;
  barcode: string;
  status: string;
  purchaseDate: string;
}

export interface TessituraDonation {
  id: string;
  amount: number;
  currency: string;
  campaignId?: string;
  campaignName?: string;
  designation?: string;
  isRecurring: boolean;
  frequency?: string;
  donationDate: string;
  taxReceiptNumber?: string;
}

export interface TessituraSubscription {
  id: string;
  packageId: string;
  packageName: string;
  season: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  performances: TessituraPerformance[];
}

export interface TessituraPerformance {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  hasTicket: boolean;
}

export interface TessituraMembership {
  id: string;
  levelId: string;
  levelName: string;
  status: string;
  startDate: string;
  endDate: string;
  benefits: string[];
  autoRenew: boolean;
}

export interface TessituraPaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface TessituraOrderRequest {
  patronId: string;
  performanceId: string;
  seats: {
    section: string;
    row: string;
    seat: string;
  }[];
  paymentMethodId: string;
}

export interface TessituraOrderResponse {
  orderId: string;
  tickets: TessituraTicket[];
  totalAmount: number;
  currency: string;
  confirmationNumber: string;
}
