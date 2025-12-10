import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "@/services/api";

export default function PaymentPage() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const cartId = params.id;

  const billing = {
    FirstName: params.first,
    LastName: params.last,
    Email: params.email,
    Phone: params.phone,
    Address: params.address,
    City: params.city,
    Province: params.province,
    PostalCode: params.postal
  };

  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);

  const payNow = async () => {
    try {
      setProcessing(true);

      // 1️⃣ Tokenize credit card
      const tokenRes = await api.post("/api/payment/tokenize", {
        CardNumber: cardNumber,
        ExpirationMonth: expMonth,
        ExpirationYear: expYear,
        CVV: cvv,
        PostalCode: billing.PostalCode
      });

      const token = tokenRes.data.token;

      // 2️⃣ Add payment to cart
      await api.post(`/api/cart/${cartId}/payment`, {
        token,
        amount: 0
      });

      // 3️⃣ Complete checkout
      const checkout = await api.post(`/api/cart/${cartId}/checkout`, {
        billing
      });

      Alert.alert("Order Successful", `Order #: ${checkout.data.order?.OrderNumber}`);

      router.replace("/order-success");

    } catch (err: any) {
      console.log("PAYMENT ERROR", err.response?.data || err.message);
      Alert.alert("Error", "Payment failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <TextInput placeholder="Card Number" value={cardNumber} onChangeText={setCardNumber} style={styles.input} keyboardType="number-pad" />
      <TextInput placeholder="MM" value={expMonth} onChangeText={setExpMonth} style={styles.inputSmall} />
      <TextInput placeholder="YYYY" value={expYear} onChangeText={setExpYear} style={styles.inputSmall} />
      <TextInput placeholder="CVV" value={cvv} onChangeText={setCvv} style={styles.inputSmall} secureTextEntry />

      <TouchableOpacity style={styles.payBtn} onPress={payNow} disabled={processing}>
        <Text style={styles.payText}>{processing ? "Processing..." : "Pay Now"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 10 },
  inputSmall: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, width: 100, marginBottom: 10 },
  payBtn: { backgroundColor: "#000", padding: 15, borderRadius: 8, marginTop: 20 },
  payText: { color: "#fff", textAlign: "center", fontSize: 18 }
});
