# Calgary Opera Mobile App - API Integration Guide

## Overview

This mobile application is built using React Native with Expo and is designed to integrate with the Tessitura REST API. The app provides patrons with access to their tickets, donations, subscriptions, and account information.

## Architecture

### Technology Stack
- **Framework:** React Native (Expo)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API Integration:** Tessitura REST API (ready to connect)

### Key Features
- User authentication with email/password
- Ticket viewing with QR codes
- Donation history and tax receipts
- Subscription management
- Account profile and settings

## API Integration Points

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Tessitura API Configuration
EXPO_PUBLIC_TESSITURA_API_URL=https://your-tessitura-instance.com/api
EXPO_PUBLIC_TESSITURA_API_KEY=your_api_key
EXPO_PUBLIC_TESSITURA_USERNAME=your_username
EXPO_PUBLIC_TESSITURA_PASSWORD=your_password
```

### 2. Authentication Flow

The authentication flow is implemented in `/contexts/AuthContext.tsx`:

1. User enters credentials
2. App attempts Supabase authentication
3. If successful and patron exists, load patron data
4. If patron doesn't exist, sync from Tessitura API
5. Store session and redirect to app

**File:** `/contexts/AuthContext.tsx`
- `signIn()` - Main authentication function
- `syncPatronToSupabase()` - Syncs Tessitura data to local database

### 3. Tessitura API Service

The Tessitura API integration is centralized in `/services/tessitura.ts`:

**Implemented Methods:**
- `authenticatePatron(email, password)` - Authenticate and fetch patron data
- `getPatronTickets(patronId)` - Fetch patron's tickets
- `getPatronDonations(patronId)` - Fetch donation history
- `getPatronSubscriptions(patronId)` - Fetch subscriptions
- `getPatronMemberships(patronId)` - Fetch memberships

**To Connect:**
1. Update `/services/tessitura.ts` with actual Tessitura API endpoints
2. Ensure proper authentication headers are included
3. Map Tessitura response fields to database schema

### 4. Database Schema

The Supabase database includes the following tables:

**patrons**
- User profile information
- Links to Tessitura patron ID
- Contact details and preferences

**tickets**
- Event tickets with QR codes
- Seat information
- Status tracking

**donations**
- Donation history
- Tax receipt information
- Campaign details

**subscriptions**
- Season subscriptions
- Auto-renewal settings
- Performance counts

**memberships**
- Membership tier
- Benefits
- Expiry dates

**payment_methods**
- Stored payment information
- Default payment selection

### 5. Data Synchronization

#### Real-time Sync Strategy

For production deployment, implement the following sync strategies:

**Option A: Webhook-based Sync**
1. Configure Tessitura webhooks to notify the app when data changes
2. Create Supabase Edge Functions to handle webhook events
3. Update local database when changes occur

**Option B: Polling-based Sync**
1. Implement background jobs to periodically fetch data from Tessitura
2. Compare and update changed records
3. Use last_sync timestamps to optimize queries

**Option C: On-demand Sync**
1. Sync data when user opens the app
2. Use pull-to-refresh to manually sync
3. Cache data locally for offline access

#### Recommended Implementation

```typescript
// services/sync.ts
export async function syncPatronData(patronId: string) {
  try {
    // Fetch latest data from Tessitura
    const [tickets, donations, subscriptions, memberships] = await Promise.all([
      tessituraAPI.getPatronTickets(patronId),
      tessituraAPI.getPatronDonations(patronId),
      tessituraAPI.getPatronSubscriptions(patronId),
      tessituraAPI.getPatronMemberships(patronId),
    ]);

    // Upsert to Supabase
    await Promise.all([
      supabase.from('tickets').upsert(tickets),
      supabase.from('donations').upsert(donations),
      supabase.from('subscriptions').upsert(subscriptions),
      supabase.from('memberships').upsert(memberships),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error };
  }
}
```

### 6. Key Files to Update

#### `/services/tessitura.ts`
- Update API endpoints
- Implement proper authentication
- Map response data to database schema

#### `/contexts/AuthContext.tsx`
- Ensure proper Tessitura authentication flow
- Handle sync errors gracefully

#### `/lib/api-config.ts`
- Configure API endpoints
- Set timeout and retry policies

### 7. Testing

1. **Test Authentication:**
   - Verify login with Tessitura credentials
   - Check patron data sync

2. **Test Data Fetching:**
   - Verify tickets display correctly
   - Check QR code generation
   - Validate donation history
   - Confirm subscription details

3. **Test Offline Mode:**
   - Ensure cached data displays when offline
   - Handle sync failures gracefully

### 8. Security Considerations

- **Never expose API keys in client code**
- Use environment variables for all sensitive data
- Implement proper RLS policies in Supabase
- Use HTTPS for all API communications
- Validate and sanitize all user inputs
- Implement rate limiting on API calls

### 9. Deployment Checklist

- [ ] Configure production Tessitura API credentials
- [ ] Set up Supabase production environment
- [ ] Configure environment variables
- [ ] Test authentication flow
- [ ] Verify data synchronization
- [ ] Test offline functionality
- [ ] Configure app signing
- [ ] Submit to App Store / Play Store

## Sample Data

The app includes sample data for testing:

**Test Account:**
- Email: `test@calgaryopera.com`
- Password: `TestPassword123!`

**Sample Data Includes:**
- 3 upcoming shows (Little Red Riding Hood, Hansel and Gretel, The Barber of Seville)
- 1 active subscription (3-Show Package)
- 1 donation with tax receipt
- 1 active membership (Patron Circle)

## Support

For technical support or questions about integration, contact the development team.

## License

Copyright © 2025 Calgary Opera. All rights reserved.
