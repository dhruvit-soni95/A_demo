import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ticket as TicketIcon, X, MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import type { Ticket } from '@/types/database';

export default function TicketsScreen() {
  const { patron } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (patron?.id) {
      loadTickets();
    }
  }, [patron?.id]);

  const loadTickets = async () => {
    if (!patron?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('patron_id', patron.id)
        .eq('status', 'active')
        .order('event_date', { ascending: true });

      if (error) throw error;
      if (data) setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
    setLoading(false);
  };

  const handleTicketPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
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
      <View style={styles.header}>
        <Text style={styles.title}>My Tickets</Text>
        <Text style={styles.subtitle}>{tickets.length} upcoming shows</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => handleTicketPress(ticket)}
              activeOpacity={0.7}
            >
              <View style={styles.ticketHeader}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.badgeMonth}>
                    {new Date(ticket.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </Text>
                  <Text style={styles.badgeDay}>
                    {new Date(ticket.event_date).getDate()}
                  </Text>
                </View>
                <View style={styles.ticketHeaderContent}>
                  <Text style={styles.eventName}>{ticket.event_name}</Text>
                  <View style={styles.infoRow}>
                    <MapPin size={14} color="#666666" />
                    <Text style={styles.infoText}>{ticket.venue_name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Clock size={14} color="#666666" />
                    <Text style={styles.infoText}>
                      {new Date(ticket.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.ticketDivider} />
              <View style={styles.ticketFooter}>
                <View>
                  <Text style={styles.seatLabel}>Seat Location</Text>
                  <Text style={styles.seatInfo}>
                    {ticket.seat_section} • Row {ticket.seat_row} • Seat {ticket.seat_number}
                  </Text>
                </View>
                <View style={styles.qrIcon}>
                  <TicketIcon size={20} color="#000000" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <TicketIcon size={64} color="#CCCCCC" />
            </View>
            <Text style={styles.emptyText}>No tickets yet</Text>
            <Text style={styles.emptySubtext}>
              Your tickets will appear here once you purchase them
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket QR Code</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            {selectedTicket && (
              <>
                <View style={styles.qrContainer}>
                  <QRCode value={selectedTicket.qr_code_data} size={240} />
                </View>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketInfoTitle}>{selectedTicket.event_name}</Text>
                  <Text style={styles.ticketInfoDate}>
                    {new Date(selectedTicket.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} at {new Date(selectedTicket.event_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.ticketInfoSeat}>
                    {selectedTicket.seat_section} • Row {selectedTicket.seat_row} • Seat {selectedTicket.seat_number}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    maxWidth: 280,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  eventDateBadge: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  badgeMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  badgeDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  ticketHeaderContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  seatLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  seatInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  qrIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  ticketInfo: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  ticketInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  ticketInfoDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  ticketInfoSeat: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
