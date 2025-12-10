import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as SecureStore from "expo-secure-store";
import {
  User as UserIcon,
  CreditCard,
  Heart,
  Gift,
  Receipt,
  Settings,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react-native';

export default function AccountScreen() {
  // const { patron, signOut } = useAuth();
  const { user, signOut } = useAuth();


  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };


  const MenuItem = ({ icon: Icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Icon size={20} color="#8B0000" />
        </View>
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#999999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <UserIcon size={32} color="#000000" />
          </View>
          {/* <Text style={styles.name}>
            {patron?.first_name} {patron?.last_name}
          </Text>
          <Text style={styles.email}>{patron?.email}</Text> */}
          <Text style={styles.name}>
            {user?.email}
          </Text>

          {/* <Text style={styles.email}>
  {user?.PrimaryElectronicAddress?.Address}
</Text> */}

        </View>

        {/* <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            {patron?.email && (
              <View style={styles.infoRow}>
                <Mail size={18} color="#666666" />
                <Text style={styles.infoText}>{patron.email}</Text>
              </View>
            )}
            {patron?.phone && (
              <View style={styles.infoRow}>
                <Phone size={18} color="#666666" />
                <Text style={styles.infoText}>{patron.phone}</Text>
              </View>
            )}
            {patron?.address_line1 && (
              <View style={styles.infoRow}>
                <MapPin size={18} color="#666666" />
                <Text style={styles.infoText}>
                  {patron.address_line1}{patron.address_line2 ? `, ${patron.address_line2}` : ''}\n
                  {patron.city}, {patron.province} {patron.postal_code}
                </Text>
              </View>
            )}
          </View>
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <View style={styles.menuGroup}>
            {/* <MenuItem icon={CreditCard} title="Manage Account" onPress={() => { }} /> */}
            <MenuItem icon={UserIcon} title="Manage Account" onPress={() => router.push("/(account)/manage-account")} />
            <MenuItem icon={CreditCard} title="Payment Methods" onPress={() => { }} />
            <MenuItem icon={Gift} title="My Subscriptions" onPress={() => { }} />
            <MenuItem icon={Receipt} title="Tax Receipts" onPress={() => { }} />
            {/* <MenuItem icon={Receipt} title="Cart" onPress={() => { router.push(`/cart/[id]`); }} /> */}
            {/* import * as SecureStore from "expo-secure-store"; */}

            <MenuItem
              icon={Receipt}
              title="Cart"
              onPress={async () => {
                const savedCartId = await SecureStore.getItemAsync("cartId");
                if (!savedCartId || savedCartId === "null" || savedCartId === "undefined") {
                  Alert.alert("Cart Empty", "No active cart found.");
                  return;
                }
                router.push(`/cart/${savedCartId}`);

                // if (!savedCartId) {
                //   Alert.alert("Cart Empty", "No active cart found.");
                //   return;
                // }
                // router.replace(`/cart/${savedCartId}`);  // ⬅ FIX
              }}

            />



          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuGroup}>
            <MenuItem icon={Settings} title="Preferences" onPress={() => { }} />
            <MenuItem icon={LogOut} title="Sign Out" onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  infoSection: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
  },
});
