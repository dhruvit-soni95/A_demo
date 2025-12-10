import { useEffect } from "react";
import { Stack, router } from "expo-router";
import * as Linking from "expo-linking";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (url: string) => {
    const parsed = Linking.parse(url);

    if (parsed.path === "reset-password") {
      const token = parsed.queryParams?.token as string;

      router.push({
        pathname: "/reset-password",
        params: { token },
      });
    }
  };

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}










// import { useEffect } from "react";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import * as Linking from "expo-linking";
// import { useFrameworkReady } from "@/hooks/useFrameworkReady";
// import { AuthProvider } from "@/contexts/AuthContext";

// export default function RootLayout() {
//   useFrameworkReady();

//   // --------------------------
//   // HANDLE DEEP LINKS (RESET PASSWORD)
//   // --------------------------
//   useEffect(() => {
//     // When app is opened fresh by a deep link
//     Linking.getInitialURL().then((url) => {
//       if (url) handleDeepLink(url);
//     });

//     // When app is already open & receives a link
//     const subscription = Linking.addEventListener("url", (event) => {
//       handleDeepLink(event.url);
//     });

//     return () => subscription.remove();
//   }, []);

//   // --------------------------
//   // PARSE URL AND ROUTE
//   // --------------------------
//   const handleDeepLink = (url: string) => {
//     try {
//       const parsed = Linking.parse(url);

//       if (parsed?.path === "reset-password") {
//         const token = parsed.queryParams?.token;

//         // router.push(`/reset-password?token=${token}`);
//         router.push({
//           pathname: "/reset-password/index",
//           params: { token }
//         });

//       }
//     } catch (err) {
//       console.log("Deep Link Error:", err);
//     }
//   };

//   return (
//     <AuthProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(auth)" />
//         <Stack.Screen name="(tabs)" />
//         <Stack.Screen name="+not-found" />
//       </Stack>

//       <StatusBar style="auto" />
//     </AuthProvider>
//   );
// }














// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import { AuthProvider } from '@/contexts/AuthContext';

// export default function RootLayout() {
//   useFrameworkReady();

//   return (
//     <AuthProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(auth)" />
//         <Stack.Screen name="(tabs)" />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </AuthProvider>
//   );
// }
