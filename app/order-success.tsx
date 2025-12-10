import { View, Text, StyleSheet } from "react-native";

export default function OrderSuccess() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Successful!</Text>
      <Text>Your confirmation email has been sent.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10 }
});
