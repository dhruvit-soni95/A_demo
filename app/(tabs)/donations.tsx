import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, Download, Receipt as ReceiptIcon } from 'lucide-react-native';
import type { Donation } from '@/types/database';

export default function DonationsScreen() {
  const { patron } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);

  useEffect(() => {
    if (patron?.id) {
      loadDonations();
    }
  }, [patron?.id]);

  const loadDonations = async () => {
    if (!patron?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('patron_id', patron.id)
        .order('donation_date', { ascending: false });

      if (error) throw error;
      if (data) {
        setDonations(data);
        const total = data.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);
        setTotalDonated(total);
      }
    } catch (error) {
      console.error('Error loading donations:', error);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDonations();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Donations</Text>
        <Text style={styles.subtitle}>Thank you for your support</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {donations.length > 0 && (
          <View style={styles.totalCard}>
            <View style={styles.totalIconContainer}>
              <Heart size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.totalLabel}>Total Donated</Text>
            <Text style={styles.totalAmount}>${totalDonated.toFixed(2)}</Text>
          </View>
        )}

        {donations.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Donation History</Text>
            {donations.map((donation) => (
              <View key={donation.id} style={styles.donationCard}>
                <View style={styles.donationHeader}>
                  <View>
                    <Text style={styles.campaignName}>{donation.campaign_name}</Text>
                    <Text style={styles.donationDate}>
                      {new Date(donation.donation_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.donationAmount}>
                    ${parseFloat(donation.amount).toFixed(2)}
                  </Text>
                </View>

                {donation.is_recurring && (
                  <View style={styles.recurringBadge}>
                    <Text style={styles.recurringText}>RECURRING</Text>
                  </View>
                )}

                {donation.tax_receipt_number && (
                  <View style={styles.receiptSection}>
                    <View style={styles.receiptInfo}>
                      <ReceiptIcon size={16} color="#666666" />
                      <Text style={styles.receiptNumber}>
                        Receipt: {donation.tax_receipt_number}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.downloadButton}>
                      <Download size={16} color="#000000" />
                      <Text style={styles.downloadText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <Heart size={64} color="#CCCCCC" />
            </View>
            <Text style={styles.emptyText}>No donations yet</Text>
            <Text style={styles.emptySubtext}>
              Your donation history will appear here
            </Text>
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
  totalCard: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  donationDate: {
    fontSize: 14,
    color: '#666666',
  },
  donationAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  recurringBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  recurringText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1976D2',
  },
  receiptSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  receiptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptNumber: {
    fontSize: 12,
    color: '#666666',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
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
});
