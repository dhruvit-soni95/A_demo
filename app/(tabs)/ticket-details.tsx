import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, MapPin, Plus, Minus, CreditCard } from 'lucide-react-native';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue_name: string;
  venue_address: string;
  price_adult: string;
  price_youth: string;
  price_senior: string;
  available_seats: number;
}

export default function TicketDetailsScreen() {
  const { eventId } = useLocalSearchParams();
  const { patron } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [adultQty, setAdultQty] = useState(0);
  const [youthQty, setYouthQty] = useState(0);
  const [seniorQty, setSeniorQty] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        Alert.alert('Error', 'Event not found');
        router.back();
        return;
      }
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details');
      router.back();
    }
    setLoading(false);
  };

  const getTotalTickets = () => adultQty + youthQty + seniorQty;

  const getTotalPrice = () => {
    if (!event) return 0;
    return (
      adultQty * parseFloat(event.price_adult) +
      youthQty * parseFloat(event.price_youth) +
      seniorQty * parseFloat(event.price_senior)
    );
  };

  const handleCheckout = async () => {
    if (getTotalTickets() === 0) {
      Alert.alert('No Tickets Selected', 'Please select at least one ticket');
      return;
    }

    if (!patron?.id || !event) return;

    setProcessing(true);
    try {
      const tickets = [];

      for (let i = 0; i < adultQty; i++) {
        tickets.push({
          patron_id: patron.id,
          tessitura_ticket_id: `TKT-${Date.now()}-${i}`,
          event_name: event.title,
          event_date: event.event_date,
          venue_name: event.venue_name,
          seat_section: 'Orchestra',
          seat_row: String.fromCharCode(65 + Math.floor(Math.random() * 20)),
          seat_number: String(Math.floor(Math.random() * 30) + 1),
          ticket_type: 'single',
          qr_code_data: `${event.title}-${Date.now()}-${i}`,
          status: 'active',
        });
      }

      for (let i = 0; i < youthQty; i++) {
        tickets.push({
          patron_id: patron.id,
          tessitura_ticket_id: `TKT-${Date.now()}-Y-${i}`,
          event_name: event.title,
          event_date: event.event_date,
          venue_name: event.venue_name,
          seat_section: 'Orchestra',
          seat_row: String.fromCharCode(65 + Math.floor(Math.random() * 20)),
          seat_number: String(Math.floor(Math.random() * 30) + 1),
          ticket_type: 'single',
          qr_code_data: `${event.title}-${Date.now()}-Y-${i}`,
          status: 'active',
        });
      }

      for (let i = 0; i < seniorQty; i++) {
        tickets.push({
          patron_id: patron.id,
          tessitura_ticket_id: `TKT-${Date.now()}-S-${i}`,
          event_name: event.title,
          event_date: event.event_date,
          venue_name: event.venue_name,
          seat_section: 'Orchestra',
          seat_row: String.fromCharCode(65 + Math.floor(Math.random() * 20)),
          seat_number: String(Math.floor(Math.random() * 30) + 1),
          ticket_type: 'single',
          qr_code_data: `${event.title}-${Date.now()}-S-${i}`,
          status: 'active',
        });
      }

      const { error } = await supabase.from('tickets').insert(tickets);

      if (error) throw error;

      Alert.alert(
        'Purchase Successful!',
        `Your ${getTotalTickets()} ticket${getTotalTickets() > 1 ? 's' : ''} purchased successfully.`,
        [
          {
            text: 'View Tickets',
            onPress: () => router.push('/(tabs)/tickets'),
          },
        ]
      );
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      Alert.alert('Error', 'Failed to complete purchase. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Tickets</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#666666" />
            <Text style={styles.infoText}>
              {new Date(event.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#666666" />
            <Text style={styles.infoText}>{event.venue_name}</Text>
          </View>
          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Tickets</Text>

          <View style={styles.ticketSelector}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketType}>Adult</Text>
              <Text style={styles.ticketPrice}>${parseFloat(event.price_adult).toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setAdultQty(Math.max(0, adultQty - 1))}
                disabled={adultQty === 0}
              >
                <Minus size={20} color={adultQty === 0 ? '#CCCCCC' : '#000000'} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{adultQty}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setAdultQty(adultQty + 1)}
              >
                <Plus size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ticketSelector}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketType}>Youth</Text>
              <Text style={styles.ticketPrice}>${parseFloat(event.price_youth).toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setYouthQty(Math.max(0, youthQty - 1))}
                disabled={youthQty === 0}
              >
                <Minus size={20} color={youthQty === 0 ? '#CCCCCC' : '#000000'} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{youthQty}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setYouthQty(youthQty + 1)}
              >
                <Plus size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ticketSelector}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketType}>Senior</Text>
              <Text style={styles.ticketPrice}>${parseFloat(event.price_senior).toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setSeniorQty(Math.max(0, seniorQty - 1))}
                disabled={seniorQty === 0}
              >
                <Minus size={20} color={seniorQty === 0 ? '#CCCCCC' : '#000000'} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{seniorQty}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setSeniorQty(seniorQty + 1)}
              >
                <Plus size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total ({getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''})</Text>
          <Text style={styles.totalAmount}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, (processing || getTotalTickets() === 0) && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={processing || getTotalTickets() === 0}
          activeOpacity={0.7}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  eventInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 12,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  ticketSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 14,
    color: '#666666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  checkoutButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
