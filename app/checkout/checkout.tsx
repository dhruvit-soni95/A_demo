// app/cart/checkout.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import api from "@/services/api";

type AnyObj = Record<string, any>;

export default function CheckoutPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [cart, setCart] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Billing Form State
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postal, setPostal] = useState("");

  // Donation & Notes
  const [donation, setDonation] = useState("0");
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    loadCart();
    loadProfile();
  }, [id]);

  // -----------------------------
  // Load User Profile
  // -----------------------------
  const loadProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;

      const res = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.success) return;

      const u = res.data.user;

      setFirst(u.firstName || "");
      setLast(u.lastName || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
      setAddress(u.address?.street1 || "");
      setCity(u.address?.city || "");
      setProvince(u.address?.province || "");
      setPostal(u.address?.postalCode || "");
    } catch (err) {
      console.log("LOAD PROFILE ERROR:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // -----------------------------
  // Load Cart
  // -----------------------------
  const loadCart = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.get(`/api/cart/${id}`, { headers });

      if (res.data?.expired) {
        await SecureStore.setItemAsync("cartId", res.data.newCartId);
        router.replace(`/cart/${res.data.newCartId}`);
        return;
      }

      setCart(res.data ?? null);
    } catch (err: any) {
      console.log("CHECKOUT LOAD ERROR:", err?.response?.data ?? err?.message);
      Alert.alert("Error", "Unable to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!first || !last || !email) {
      Alert.alert("Missing Info", "First Name, Last Name, Email are required.");
      return;
    }

    router.push({
      pathname: "/cart/payment",
      params: {
        id,
        first,
        last,
        email,
        phone,
        address,
        city,
        province,
        postal,
        donation,
        orderNote,
      },
    });
  };

  if (loading || loadingProfile) {
    return (
      <View style={styles.center}>
        <Text>Loading checkout…</Text>
      </View>
    );
  }

  if (!cart) {
    return (
      <View style={styles.center}>
        <Text>No cart found.</Text>
      </View>
    );
  }

  const items = cart.Products ?? [];

  const subtotal = Number(cart.SubTotal ?? cart.CartAmount ?? 0);
  const fees = Number(cart.FeesAmount ?? 0);
  const donationAmount = Number(donation || 0);
  const total = subtotal + fees + donationAmount;

  const getQty = (p: any) =>
    p?.Performance?.LineItem?.SubLineItems?.length || 1;

  const getTitle = (p: any) =>
    p?.Performance?.Description ||
    p?.Performance?.LineItem?.Performance?.Description ||
    "Untitled Event";

  const getDate = (p: any) =>
    new Date(
      p?.Performance?.PerformanceDateTime ??
      p?.Performance?.LineItem?.Performance?.PerformanceDateTime
    ).toLocaleString();

  const getUnitPrice = (p: any) =>
    Number(
      p?.Performance?.LineItem?.SubLineItems?.[0]?.SubLineItemDetails?.[0]
        ?.OriginalPrice ??
      p?.Performance?.LineItem?.SubLineItems?.[0]?.DueAmount ??
      0
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      {/*  ORDER SUMMARY */}
      <Text style={styles.sectionTitle}>Order Summary</Text>

      {items.map((p: any, index: number) => (
        <View key={index} style={styles.itemBox}>
          <Text style={styles.event}>{getTitle(p)}</Text>
          <Text style={styles.date}>{getDate(p)}</Text>
          <Text>Qty: {getQty(p)}</Text>
          <Text>Price: ${getUnitPrice(p).toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.totalBox}>
        <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
        <Text>Fees: ${fees.toFixed(2)}</Text>
        <Text>Donation: ${donationAmount.toFixed(2)}</Text>
        <Text style={{ fontWeight: "700" }}>Total: ${total.toFixed(2)}</Text>
      </View>

      {/* DONATION */}
      <Text style={styles.sectionTitle}>Add a Donation</Text>
      <TextInput
        placeholder="0.00"
        keyboardType="numeric"
        value={donation}
        onChangeText={(t) => setDonation(t.replace(/[^\d.]/g, ""))}
        style={styles.input}
      />

      {/* NOTE */}
      <Text style={styles.sectionTitle}>Order Note</Text>
      <TextInput
        placeholder="Any special instructions..."
        value={orderNote}
        onChangeText={setOrderNote}
        style={styles.textArea}
        multiline
      />

      {/* PREFILLED BILLING INFO */}
      <Text style={styles.sectionTitle}>Billing Information</Text>

      <TextInput style={styles.input} value={first} onChangeText={setFirst} placeholder="First Name*" />
      <TextInput style={styles.input} value={last} onChangeText={setLast} placeholder="Last Name*" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email*" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
      <TextInput style={styles.input} value={province} onChangeText={setProvince} placeholder="Province" />
      <TextInput style={styles.input} value={postal} onChangeText={setPostal} placeholder="Postal Code" />

      <TouchableOpacity style={styles.btn} onPress={handleContinue}>
        <Text style={styles.btnText}>Continue to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  itemBox: { padding: 12, backgroundColor: "#f5f5f5", borderRadius: 8, marginBottom: 10 },
  event: { fontSize: 16, fontWeight: "600" },
  date: { color: "#666", marginBottom: 6 },
  totalBox: { padding: 10, marginTop: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 },
  textArea: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, minHeight: 80 },
  btn: { backgroundColor: "#000", padding: 15, borderRadius: 8, marginTop: 20 },
  btnText: { color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "700" },
});
