import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Heart } from 'lucide-react-native';

export default function MakeDonationScreen() {
  const { patron } = useAuth();
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleDonate = async () => {
    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount < 1) {
      Alert.alert('Invalid Amount', 'Please enter a donation amount');
      return;
    }

    setProcessing(true);
    try {
      const receiptNumber = 'CO-2024-' + Math.floor(Math.random() * 900000 + 100000);
      await supabase.from('donations').insert({
        patron_id: patron?.id,
        amount: donationAmount.toFixed(2),
        currency: 'CAD',
        campaign_name: 'General Fund',
        tax_receipt_number: receiptNumber,
        donation_date: new Date().toISOString(),
      });

      Alert.alert('Thank You!', 'Your donation of $' + donationAmount.toFixed(2) + ' has been received.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/donations') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to process donation');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make a Donation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.hero}>
          <Heart size={48} color="#000000" />
          <Text style={styles.heroTitle}>Support Calgary Opera</Text>
          <Text style={styles.heroSubtitle}>Your generosity helps us bring opera to Calgary</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Donation Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.suggestions}>
            {[50, 100, 250, 500].map((value) => (
              <TouchableOpacity key={value} style={styles.suggestion} onPress={() => setAmount(String(value))}>
                <Text style={styles.suggestionText}>${value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, processing && styles.buttonDisabled]}
            onPress={handleDonate}
            disabled={processing}
          >
            <Text style={styles.buttonText}>{processing ? 'Processing...' : 'Donate Now'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000000' },
  content: { flex: 1 },
  hero: { backgroundColor: '#FFFFFF', padding: 32, alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#000000', marginTop: 16 },
  heroSubtitle: { fontSize: 14, color: '#666666', textAlign: 'center', marginTop: 8 },
  form: { padding: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginBottom: 16 },
  currency: { fontSize: 20, fontWeight: '600', color: '#000000', marginRight: 8 },
  input: { flex: 1, fontSize: 20, fontWeight: '600', color: '#000000' },
  suggestions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  suggestion: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, alignItems: 'center' },
  suggestionText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  button: { backgroundColor: '#000000', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
