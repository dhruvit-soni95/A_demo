import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendResetEmail } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      return Alert.alert("Error", "Please enter your email address");
    }

    setLoading(true);

    const res = await sendResetEmail(email);

    if (res.success) {
      Alert.alert("Email Sent", "Check your inbox for reset instructions.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Error", res.msg || "Unable to send reset email");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we’ll send you instructions.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Email</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  backButton: { padding: 16 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 12 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  button: {
    height: 50,
    backgroundColor: "#000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});




























// import { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { router } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth } from '@/contexts/AuthContext';
// import { ArrowLeft } from 'lucide-react-native';

// export default function ForgotPasswordScreen() {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { resetPassword } = useAuth();

//   const handleResetPassword = async () => {
//     if (!email) {
//       Alert.alert('Error', 'Please enter your email address');
//       return;
//     }

//     try {
//       setLoading(true);
//       await resetPassword(email);
//       Alert.alert(
//         'Email Sent',
//         'Password reset instructions have been sent to your email',
//         [{ text: 'OK', onPress: () => router.back() }]
//       );
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to send reset email');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//         <ArrowLeft size={24} color="#333333" />
//       </TouchableOpacity>

//       <View style={styles.content}>
//         <Text style={styles.title}>Reset Password</Text>
//         <Text style={styles.subtitle}>
//           Enter your email address and we'll send you instructions to reset your password
//         </Text>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Email</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="patron@example.com"
//             placeholderTextColor="#999999"
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             autoCorrect={false}
//             editable={!loading}
//           />
//         </View>

//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonDisabled]}
//           onPress={handleResetPassword}
//           disabled={loading}>
//           {loading ? (
//             <ActivityIndicator color="#FFFFFF" />
//           ) : (
//             <Text style={styles.buttonText}>Send Reset Link</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   backButton: {
//     padding: 16,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 24,
//     paddingTop: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: '#000000',
//     marginBottom: 12,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666666',
//     marginBottom: 32,
//     lineHeight: 24,
//   },
//   inputGroup: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333333',
//     marginBottom: 8,
//   },
//   input: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#DDDDDD',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     color: '#333333',
//     backgroundColor: '#FAFAFA',
//   },
//   button: {
//     height: 50,
//     backgroundColor: '#000000',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
