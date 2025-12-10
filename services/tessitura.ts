import api from "./api";

export async function login(email: string, password: string) {
  return api.post("/api/auth/login", { email, password });
}

export async function register(firstName: string, lastName: string, email: string, password: string) {
  return api.post("/api/auth/register", {
    firstName,
    lastName,
    email,
    password,
  });
}

export async function getPerformances() {
  return api.get("/api/performances");
}

export async function getPerformanceById(id: string) {
  return api.get(`/api/performances/${id}`);
}

export async function getPerformancePrices(id: string) {
  return api.get(`/api/performances/${id}/prices`);
}

export async function getPerformanceSeats(id: string) {
  return api.get(`/api/performances/${id}/seats`);
}

export async function getPerformanceAvailability(id: string) {
  return api.get(`/api/performances/${id}/availability`);
}

export async function getFullPerformance(id: string) {
  return api.get(`/api/performances/${id}/full`);
}









// import axios, { AxiosInstance } from 'axios';
// import type {
//   TessituraAuthResponse,
//   TessituraPatron,
//   TessituraEvent,
//   TessituraTicket,
//   TessituraDonation,
//   TessituraSubscription,
//   TessituraMembership,
//   TessituraPaymentMethod,
//   TessituraOrderRequest,
//   TessituraOrderResponse,
// } from '@/types/tessitura';

// class TessituraAPI {
//   private client: AxiosInstance;
//   private accessToken: string | null = null;
//   private tokenExpiry: number = 0;

//   constructor() {
//     this.client = axios.create({
//       baseURL: process.env.EXPO_PUBLIC_TESSITURA_API_URL || '',
//       timeout: 30000,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     this.client.interceptors.request.use(async (config) => {
//       await this.ensureAuthenticated();
//       if (this.accessToken) {
//         config.headers.Authorization = `Bearer ${this.accessToken}`;
//       }
//       return config;
//     });
//   }

//   private async ensureAuthenticated(): Promise<void> {
//     if (this.accessToken && Date.now() < this.tokenExpiry) {
//       return;
//     }

//     try {
//       const response = await axios.post<TessituraAuthResponse>(
//         `${process.env.EXPO_PUBLIC_TESSITURA_API_URL}/oauth/token`,
//         {
//           grant_type: 'client_credentials',
//           client_id: process.env.EXPO_PUBLIC_TESSITURA_CLIENT_ID,
//           client_secret: process.env.EXPO_PUBLIC_TESSITURA_CLIENT_SECRET,
//         }
//       );

//       this.accessToken = response.data.access_token;
//       this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
//     } catch (error) {
//       console.error('Failed to authenticate with Tessitura:', error);
//       throw new Error('Authentication failed');
//     }
//   }

//   async getPatron(patronId: string): Promise<TessituraPatron> {
//     const response = await this.client.get<TessituraPatron>(`/patrons/${patronId}`);
//     return response.data;
//   }

//   async authenticatePatron(email: string, password: string): Promise<TessituraPatron> {
//     const response = await this.client.post<TessituraPatron>('/patrons/authenticate', {
//       email,
//       password,
//     });
//     return response.data;
//   }

//   async updatePatron(patronId: string, data: Partial<TessituraPatron>): Promise<TessituraPatron> {
//     const response = await this.client.put<TessituraPatron>(`/patrons/${patronId}`, data);
//     return response.data;
//   }

//   async getEvents(params?: { startDate?: string; endDate?: string }): Promise<TessituraEvent[]> {
//     const response = await this.client.get<TessituraEvent[]>('/events', { params });
//     return response.data;
//   }

//   async getEvent(eventId: string): Promise<TessituraEvent> {
//     const response = await this.client.get<TessituraEvent>(`/events/${eventId}`);
//     return response.data;
//   }

//   async getPatronTickets(patronId: string): Promise<TessituraTicket[]> {
//     const response = await this.client.get<TessituraTicket[]>(`/patrons/${patronId}/tickets`);
//     return response.data;
//   }

//   async purchaseTickets(orderRequest: TessituraOrderRequest): Promise<TessituraOrderResponse> {
//     const response = await this.client.post<TessituraOrderResponse>('/orders', orderRequest);
//     return response.data;
//   }

//   async getPatronDonations(patronId: string): Promise<TessituraDonation[]> {
//     const response = await this.client.get<TessituraDonation[]>(`/patrons/${patronId}/donations`);
//     return response.data;
//   }

//   async makeDonation(patronId: string, donation: {
//     amount: number;
//     currency: string;
//     campaignId?: string;
//     designation?: string;
//     isRecurring?: boolean;
//     frequency?: string;
//     paymentMethodId: string;
//   }): Promise<TessituraDonation> {
//     const response = await this.client.post<TessituraDonation>(
//       `/patrons/${patronId}/donations`,
//       donation
//     );
//     return response.data;
//   }

//   async getPatronSubscriptions(patronId: string): Promise<TessituraSubscription[]> {
//     const response = await this.client.get<TessituraSubscription[]>(`/patrons/${patronId}/subscriptions`);
//     return response.data;
//   }

//   async purchaseSubscription(patronId: string, subscription: {
//     packageId: string;
//     season: string;
//     autoRenew?: boolean;
//     paymentMethodId: string;
//   }): Promise<TessituraSubscription> {
//     const response = await this.client.post<TessituraSubscription>(
//       `/patrons/${patronId}/subscriptions`,
//       subscription
//     );
//     return response.data;
//   }

//   async getPatronMemberships(patronId: string): Promise<TessituraMembership[]> {
//     const response = await this.client.get<TessituraMembership[]>(`/patrons/${patronId}/memberships`);
//     return response.data;
//   }

//   async purchaseMembership(patronId: string, membership: {
//     levelId: string;
//     autoRenew?: boolean;
//     paymentMethodId: string;
//   }): Promise<TessituraMembership> {
//     const response = await this.client.post<TessituraMembership>(
//       `/patrons/${patronId}/memberships`,
//       membership
//     );
//     return response.data;
//   }

//   async getPaymentMethods(patronId: string): Promise<TessituraPaymentMethod[]> {
//     const response = await this.client.get<TessituraPaymentMethod[]>(`/patrons/${patronId}/payment-methods`);
//     return response.data;
//   }

//   async addPaymentMethod(patronId: string, paymentMethod: {
//     type: string;
//     cardNumber: string;
//     expiryMonth: number;
//     expiryYear: number;
//     cvv: string;
//     billingAddress: any;
//   }): Promise<TessituraPaymentMethod> {
//     const response = await this.client.post<TessituraPaymentMethod>(
//       `/patrons/${patronId}/payment-methods`,
//       paymentMethod
//     );
//     return response.data;
//   }

//   async deletePaymentMethod(patronId: string, paymentMethodId: string): Promise<void> {
//     await this.client.delete(`/patrons/${patronId}/payment-methods/${paymentMethodId}`);
//   }

//   async setDefaultPaymentMethod(patronId: string, paymentMethodId: string): Promise<void> {
//     await this.client.put(`/patrons/${patronId}/payment-methods/${paymentMethodId}/set-default`);
//   }

//   async getTaxReceipt(patronId: string, donationId: string): Promise<Blob> {
//     const response = await this.client.get(
//       `/patrons/${patronId}/donations/${donationId}/tax-receipt`,
//       {
//         responseType: 'blob',
//       }
//     );
//     return response.data;
//   }
// }

// export const tessituraAPI = new TessituraAPI();
