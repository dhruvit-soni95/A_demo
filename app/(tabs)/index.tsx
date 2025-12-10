import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Heart, Ticket, DollarSign, Users } from 'lucide-react-native';
import type { Ticket as TicketType, Donation, Subscription, Membership } from '@/types/database';
import * as SecureStore from "expo-secure-store";
import api from "@/services/api";


export default function HomeScreen() {
  // const { patron } = useAuth();
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  const loadUpcomingShows = async () => {
    try {
      const res = await api.get("/api/performances");

      if (Array.isArray(res.data)) {
        // Map shows → extract date
        const shows = res.data.map((item) => ({
          ...item,
          perfDate: new Date(item.perf.Date || item.perf.PerformanceDateTime)
        }));

        // Sort by nearest date
        shows.sort((a, b) => a.perfDate.getTime() - b.perfDate.getTime());

        // Take top 5 upcoming
        setUpcoming(shows.slice(0, 5));
      }
    } catch (err) {
      console.log("UPCOMING SHOWS ERROR:", err);
    }
  };



  const loadCartCount = async () => {
    try {
      const cartId = await SecureStore.getItemAsync("cartId");
      if (!cartId) return;

      const token = await SecureStore.getItemAsync("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.get(`/api/cart/${cartId}`, { headers });
      const cart = res.data;

      if (!cart) return setCartCount(0);

      // Normalize items EXACTLY like CartPage
      const items =
        cart.Items ??
        cart.LineItems ??
        cart.Products ??
        (Array.isArray(cart.Items?.Item) ? cart.Items.Item : []) ??
        [];

      let total = 0;

      items.forEach((item: any) => {
        const subs =
          item?.Performance?.LineItem?.SubLineItems ??
          item?.SubLineItems ??
          [];

        if (Array.isArray(subs)) total += subs.length;
        else total += 1;
      });

      setCartCount(total);
    } catch (err) {
      console.log("LOAD CART COUNT ERROR:", err);
    }
  };



  useEffect(() => {
    setLoading(false);
    loadCartCount();
    loadUpcomingShows();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("🔄 HomeScreen Focused → Refreshing data");

      loadCartCount();
      loadUpcomingShows();

      return () => { };
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      loadCartCount();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, []);


  // useEffect(() => {
  //   if (patron?.id) {
  //     loadData();
  //   }
  // }, [patron?.id]);

  // const loadData = async () => {
  //   if (!patron?.id) return;

  //   setLoading(true);
  //   try {
  //     const [ticketsRes, donationsRes, subscriptionsRes, membershipsRes] = await Promise.all([
  //       supabase.from('tickets').select('*').eq('patron_id', patron.id).eq('status', 'active').order('event_date', { ascending: true }),
  //       supabase.from('donations').select('*').eq('patron_id', patron.id).order('donation_date', { ascending: false }).limit(3),
  //       supabase.from('subscriptions').select('*').eq('patron_id', patron.id).eq('status', 'active'),
  //       supabase.from('memberships').select('*').eq('patron_id', patron.id).eq('status', 'active'),
  //     ]);

  //     if (ticketsRes.data) setTickets(ticketsRes.data);
  //     if (donationsRes.data) setDonations(donationsRes.data);
  //     if (subscriptionsRes.data) setSubscriptions(subscriptionsRes.data);
  //     if (membershipsRes.data) setMemberships(membershipsRes.data);
  //   } catch (error) {
  //     console.error('Error loading data:', error);
  //   }
  //   setLoading(false);
  // };

  // const onRefresh = async () => {
  // setRefreshing(true);
  // await loadData();
  // setRefreshing(false);
  // };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCartCount();
    await loadUpcomingShows();
    setRefreshing(false);
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          {/* <Text style={styles.name}>
            {user?.firstName} {user?.middleName} {user?.lastName}
          </Text> */}
          <Text style={styles.name}>
            {user
              ? `${user.firstName || "Guest"} ${user.middleName ?? ""} ${user.lastName || ""}`.trim()
              : ""}
          </Text>

        </View>


        {/* <TouchableOpacity
          style={styles.eventsButton}
          onPress={() => router.push("/events")}
        >
          <Text style={styles.eventsButtonText}>View Performances</Text>
        </TouchableOpacity> */}


        <View style={styles.statsSection}>
          {/* <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ticket size={20} color="#000000" />
            </View>
            <Text style={styles.statValue}>{tickets.length}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View> */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ticket size={20} color="#000000" />
            </View>
            <Text style={styles.statValue}>{cartCount}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={20} color="#000000" />
            </View>
            <Text style={styles.statValue}>{memberships.length}</Text>
            <Text style={styles.statLabel}>Memberships</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Heart size={20} color="#000000" />
            </View>
            <Text style={styles.statValue}>{donations.length}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
        </View>

        {/* <TouchableOpacity onPress={() => router.push('/(tabs)/tickets')}> */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Shows</Text>

            <TouchableOpacity onPress={() => router.push("/events")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcoming.length > 0 ? (
            upcoming.map((item) => {
              const p = item.perf;
              const date = new Date(p.Date || p.PerformanceDateTime);

              return (
                <View key={item.performanceId} style={styles.eventCard}>
                  <View style={styles.eventDate}>
                    <Text style={styles.eventMonth}>
                      {date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </Text>
                    <Text style={styles.eventDay}>{date.getDate()}</Text>
                  </View>

                  <View style={styles.eventDetails}>
                    <Text style={styles.eventName}>{p.Description || p.Text1}</Text>
                    <Text style={styles.eventVenue}>{p.Text3 || "Unknown Venue"}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No upcoming shows</Text>
            </View>
          )}
        </View>

        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Shows</Text>
            <TouchableOpacity onPress={() => router.push("/events")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {tickets.length > 0 ? (
            tickets.slice(0, 2).map((ticket) => (
              <View key={ticket.id} style={styles.eventCard}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventMonth}>
                    {new Date(ticket.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </Text>
                  <Text style={styles.eventDay}>
                    {new Date(ticket.event_date).getDate()}
                  </Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventName}>{ticket.event_name}</Text>
                  <Text style={styles.eventVenue}>{ticket.venue_name}</Text>
                  <Text style={styles.eventSeat}>
                    {ticket.seat_section} • Row {ticket.seat_row} • Seat {ticket.seat_number}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No upcoming shows</Text>
            </View>
          )}
        </View> */}

        {subscriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Subscriptions</Text>
            {subscriptions.map((sub) => (
              <View key={sub.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <Text style={styles.subscriptionName}>{sub.subscription_name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.subscriptionSeason}>{sub.season} Season</Text>
                <Text style={styles.subscriptionPerformances}>
                  {sub.total_performances} performances included
                </Text>
              </View>
            ))}
          </View>
        )}

        {memberships.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership</Text>
            {memberships.map((membership) => (
              <View key={membership.id} style={styles.membershipCard}>
                <Text style={styles.membershipTier}>{membership.tier}</Text>
                <Text style={styles.membershipExpiry}>
                  Valid until {new Date(membership.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  eventsButton: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: "#8B0000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  eventsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },



  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#000000',
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  seeAll: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  eventDate: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    marginRight: 16,
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  eventDay: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  eventSeat: {
    fontSize: 12,
    color: '#999999',
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  subscriptionSeason: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  subscriptionPerformances: {
    fontSize: 12,
    color: '#999999',
  },
  membershipCard: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
  },
  membershipTier: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  membershipExpiry: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
