import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !newPassword) {
      return Alert.alert("Error", "Please fill all fields");
    }

    const res = await resetPassword(email, token as string, newPassword);

    if (res.success) {
      Alert.alert("Success", "Password updated.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } else {
      Alert.alert("Error", res.msg || "Invalid token");
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>Create New Password</Text>

      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 12, marginBottom: 20 }}
      />

      <Text>New Password</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: "black",
          padding: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Reset Password
        </Text>
      </TouchableOpacity>
    </View>
  );
}



















// import { useLocalSearchParams, router } from "expo-router";
// import { useAuth } from "@/contexts/AuthContext";
// import { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

// export default function ResetPasswordScreen() {
//   const { token } = useLocalSearchParams();
//   const { resetPassword } = useAuth();

//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");

//   const handleSubmit = async () => {
//     if (!email || !newPassword) {
//       return Alert.alert("Error", "Please fill all fields");
//     }

//     const res = await resetPassword(email, token as string, newPassword);

//     if (res.success) {
//       Alert.alert("Success", "Password updated", [
//         { text: "OK", onPress: () => router.replace("/(auth)/login") }
//       ]);
//     } else {
//       Alert.alert("Error", res.msg || "Invalid token");
//     }
//   };

//   return (
//     <View style={{ padding: 24 }}>
//       <Text style={{ fontSize: 28, marginBottom: 20 }}>Reset Password</Text>

//       <Text>Email</Text>
//       <TextInput
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         style={{ borderWidth: 1, padding: 12, marginBottom: 20 }}
//       />

//       <Text>New Password</Text>
//       <TextInput
//         value={newPassword}
//         onChangeText={setNewPassword}
//         secureTextEntry
//         style={{ borderWidth: 1, padding: 12, marginBottom: 20 }}
//       />

//       <TouchableOpacity
//         onPress={handleSubmit}
//         style={{
//           backgroundColor: "black",
//           padding: 14,
//           borderRadius: 8
//         }}
//       >
//         <Text style={{ color: "white", textAlign: "center" }}>
//           Reset Password
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
