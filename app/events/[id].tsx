import { useLocalSearchParams, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/services/api";
import { MapPin, Calendar, Ticket, Minus, Plus } from "lucide-react-native";

const PRICE_TYPES: any = {
  17: "Adult",
  364: "Child / Youth",
  371: "Promo",
  370: "Comp",
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);

  // NEW STATE
  const [selectedPrice, setSelectedPrice] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadDetails();
  }, [id]);


  const loadDetails = async () => {
    try {
      const res = await api.get(`/api/performances/${id}/full`);
      setDetails(res.data);
    } catch (e) {
      console.error("DETAIL LOAD ERROR:", e);
    }
    setLoading(false);
  };

  if (loading || !details) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  const p = details.performance;
  const isGA = p?.BestSeatMap?.IsGA === true;

  const zonesMap: any = {};
  details.zones.forEach((z: any) => {
    zonesMap[z.Zone.Id] = z.Zone.Description;
  });

  const groupedPrices: any = {};
  details.prices.forEach((price: any) => {
    if (!groupedPrices[price.ZoneId]) groupedPrices[price.ZoneId] = [];
    groupedPrices[price.ZoneId].push(price);
  });

  //
  // QUANTITY HANDLERS
  //
  const increaseQty = () => {
    if (quantity < 8) setQuantity(quantity + 1);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handlePurchase = async () => {
    if (!selectedPrice) {
      alert("Select a ticket type first.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        alert("Please sign in to buy tickets.");
        return;
      }

      const payload = {
        performanceId: Number(id),
        priceTypeId: selectedPrice.PriceTypeId,
        zoneId: selectedPrice.ZoneId ?? 0,
        quantity
      };

      const add = await api.post("/api/cart/add", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("ADD RESULT:", add.data);

      const cartId = add.data.cartId;
      // FIX: Save to SecureStore
      await SecureStore.setItemAsync("cartId", cartId);

      if (!cartId) {
        alert("Cart could not be created. Try again.");
        return;
      }

      // navigate with REAL Tessitura Web Cart ID
      router.push(`/cart/${cartId}`);

    } catch (err: any) {
      console.error("ADD ERROR:", err.response?.data || err);
      alert("Failed to add to cart.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* TITLE */}
        <Text style={styles.title}>{p.Description || p.Text1}</Text>

        {/* DATE */}
        <View style={styles.row}>
          <Calendar size={18} color="#666" />
          <Text style={styles.rowText}>
            {new Date(p.Date).toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </Text>
        </View>

        {/* VENUE */}
        <View style={styles.row}>
          <MapPin size={18} color="#666" />
          <Text style={styles.rowText}>
            {p.Text3}
            {"\n"}
            {p.Text4}
          </Text>
        </View>

        {/* PRICES */}
        <Text style={styles.sectionTitle}>Ticket Types & Prices</Text>

        {/* GA */}
        {isGA &&
          details.prices.map((price: any, idx: number) => {
            const typeLabel =
              PRICE_TYPES[price.PriceTypeId] ?? `Type ${price.PriceTypeId}`;

            const selected = selectedPrice?.PriceTypeId === price.PriceTypeId;

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.priceRowSelectable, selected && styles.selectedRow]}
                onPress={() => setSelectedPrice(price)}
              >
                <Text style={styles.priceLabel}>{typeLabel}</Text>
                <Text style={styles.priceValue}>${price.Price.toFixed(2)}</Text>
              </TouchableOpacity>
            );
          })}

        {/* SYOS */}
        {!isGA &&
          Object.keys(groupedPrices).map((zoneId) => (
            <View key={zoneId} style={styles.zoneBlock}>
              <Text style={styles.zoneTitle}>
                {zonesMap[zoneId] ?? `Zone ${zoneId}`}
              </Text>

              {groupedPrices[zoneId].map((price: any, idx: number) => {
                const typeLabel =
                  PRICE_TYPES[price.PriceTypeId] ?? `Type ${price.PriceTypeId}`;

                const selected =
                  selectedPrice?.PriceTypeId === price.PriceTypeId &&
                  selectedPrice?.ZoneId === price.ZoneId;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.priceRowSelectable, selected && styles.selectedRow]}
                    onPress={() => setSelectedPrice(price)}
                  >
                    <Text style={styles.priceLabel}>{typeLabel}</Text>
                    <Text style={styles.priceValue}>${price.Price.toFixed(2)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

        {/* QUANTITY SELECTOR */}
        {selectedPrice && (
          <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={decreaseQty} style={styles.qtyBtn}>
              <Minus size={18} />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{quantity}</Text>

            <TouchableOpacity onPress={increaseQty} style={styles.qtyBtn}>
              <Plus size={18} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.maxText}>The maximum quantity you can select is 8.</Text>

        {/* BUY BUTTON */}
        <TouchableOpacity
          style={[
            styles.buyButton,
            !selectedPrice && { backgroundColor: "#666" },
          ]}
          disabled={!selectedPrice}
          onPress={handlePurchase}
        >
          <Ticket size={20} color="#FFF" />
          <Text style={styles.buyButtonText}>
            {isGA ? "Buy Tickets" : "Continue"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

//
// STYLES
//
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 20 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },

  row: { flexDirection: "row", marginBottom: 10, gap: 10 },
  rowText: { fontSize: 16, color: "#444", flex: 1 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  // PRICE ROWS
  priceRowSelectable: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    marginBottom: 8,
  },

  selectedRow: {
    backgroundColor: "#000",
  },

  priceLabel: { fontSize: 16, color: "#333" },
  priceValue: { fontSize: 16, fontWeight: "700", color: "#333" },

  zoneBlock: {
    padding: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    marginBottom: 15,
  },

  zoneTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },

  // QUANTITY
  qtyContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 20,
  },

  qtyBtn: {
    padding: 10,
    backgroundColor: "#EEE",
    borderRadius: 6,
  },

  qtyText: { fontSize: 22, fontWeight: "700" },

  maxText: {
    marginTop: 8,
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },

  buyButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  buyButtonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
});



















// useEffect(() => {
//   const fix = async () => {
//     await SecureStore.deleteItemAsync("cartId");
//     console.log("CART ID CLEARED");
//   };

//   fix();
// }, []);  // run once






//
// PURCHASE HANDLER
//
// const handlePurchase = async () => {
//   if (!selectedPrice) return;

//   try {
//     let cartId = await SecureStore.getItemAsync("cartId");

//     // --- FIX: Log this so we know ---
//     console.log("EXISTING CART ID:", cartId);

//     // Create cart if missing
//     if (!cartId) {
//       const res = await api.post("/api/cart/create");
//       console.log("CREATE CART RESPONSE:", res.data);

//       cartId = String(res.data.Id || res.data.CartId);
//       await SecureStore.setItemAsync("cartId", cartId);

//       console.log("SAVED CART ID:", cartId);
//     }

//     // Add item
//     const addRes = await api.post("/api/cart/add", {
//       performanceId: Number(id),
//       priceTypeId: selectedPrice.PriceTypeId,
//       zoneId: selectedPrice.ZoneId,
//       quantity
//     });
//     console.log("ADD TO CART RESULT:", addRes.data);
//     router.push("/cart/[id]");
//   } catch (err) {
//     console.log("ADD TO CART ERROR:", err);
//   }
// };



// const handlePurchase = async () => {
//   if (!selectedPrice) return;

//   try {
//     // Load cartId
//     let cartId = await SecureStore.getItemAsync("cartId");
//     console.log("LOADED CART ID FROM STORAGE:", cartId);

//     // If previous runs stored the string "undefined" or "null", treat as missing
//     if (!cartId || cartId === "undefined" || cartId === "null") {
//       console.log("No valid cart found. Creating a new one...");

//       const create = await api.post("/api/cart/create");
//       console.log("CREATE CART RESPONSE:", create.data);

//       cartId = create.data?.cartId ?? create.data?.sessionKey ?? null;

//       if (!cartId) {
//         console.error("Backend did not return cartId; create.data:", create.data);
//         alert("Failed to create cart. See logs.");
//         return;
//       }

//       // persist string: SecureStore expects string
//       await SecureStore.setItemAsync("cartId", String(cartId));
//       console.log("NEW CART ID SAVED:", cartId);
//     }

//     // Add ticket call — ensure cartId is string
//     const addRes = await api.post("/api/cart/add", {
//       cartId: String(cartId),
//       performanceId: Number(id),
//       priceTypeId: selectedPrice.PriceTypeId,
//       zoneId: selectedPrice.ZoneId,
//       quantity
//     });

//     console.log("ADD TO CART RESULT:", addRes.data);

//     // Navigate to cart page that expects the cartId
//     router.push(`/cart/${encodeURIComponent(String(cartId))}`);

//   } catch (err) {
//     const error = err as any;
//     console.error("ADD TO CART ERROR:", error?.response?.data || error?.message || error);
//     alert("Add to cart failed. Check logs for details.");
//   }

// };


// const handlePurchase = async () => {
//   try {
//     const session = await api.get("/api/session");
//     const sessionKey = session.data.sessionKey;

//     const add = await api.post("/api/cart/add", {
//       performanceId: Number(id),
//       priceTypeId: selectedPrice.PriceTypeId,
//       zoneId: selectedPrice.ZoneId,
//       quantity
//     });

//     console.log("ADD RESULT:", add.data);

//     router.push("/cart/[id]");

//   } catch (error: any) {
//     console.error(error?.response?.data || error);
//   }
// };










//   const handlePurchase = async () => {
//   if (!selectedPrice) return;

//   try {
//     // 1️⃣ Load cart ID from SecureStore
//     let cartId = await SecureStore.getItemAsync("cartId");
//     console.log("EXISTING CART ID:", cartId);

//     // 2️⃣ If cart doesn't exist → create new one
//     if (!cartId) {
//       console.log("No cart found. Creating new one...");

//       const create = await api.post("/api/cart/create");
//       console.log("CREATE CART RESPONSE:", create.data);

//       cartId = create.data.cartId; // ✔ correct field
//       // await SecureStore.setItemAsync("cartId", cartId);
//       await SecureStore.setItemAsync("cartId", String(cartId));


//       console.log("NEW CART ID SAVED:", cartId);
//     }

//     // 3️⃣ Add ticket to cart
//     const addRes = await api.post("/api/cart/add", {
//       cartId,  // ✔ REQUIRED FIELD FOR BACKEND
//       performanceId: Number(id),
//       priceTypeId: selectedPrice.PriceTypeId,
//       zoneId: selectedPrice.ZoneId,
//       quantity
//     });

//     console.log("ADD TO CART RESULT:", addRes.data);

//     // 4️⃣ Navigate to Cart Page
//     router.push(`/cart/${cartId}`);

//   } catch (err) {
//     console.log("ADD TO CART ERROR:",err);
//   }
// };











// import { useLocalSearchParams, router } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import api from "@/services/api";
// import { MapPin, Calendar, Ticket } from "lucide-react-native";

// // You can expand this anytime
// const PRICE_TYPES: any = {
//   17: "Adult",
//   364: "Child / Youth",
//   371: "Promo",
//   370: "Comp",
// };

// export default function EventDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const [loading, setLoading] = useState(true);
//   const [details, setDetails] = useState<any>(null);

//   useEffect(() => {
//     loadDetails();
//   }, [id]);

//   const loadDetails = async () => {
//     try {
//       const res = await api.get(`/api/performances/${id}/full`);
//       setDetails(res.data);
//     } catch (e) {
//       console.error("DETAIL LOAD ERROR:", e);
//     }
//     setLoading(false);
//   };

//   if (loading || !details) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8B0000" />
//       </View>
//     );
//   }

//   const p = details.performance;

//   const isGA = p?.BestSeatMap?.IsGA === true; // GA shows simple Buy Tickets UI

//   // Group prices by ZoneId → ZoneName
//   const zonesMap: any = {};
//   details.zones.forEach((z: any) => {
//     zonesMap[z.Zone.Id] = z.Zone.Description;
//   });

//   const groupedPrices: any = {};
//   details.prices.forEach((price: any) => {
//     if (!groupedPrices[price.ZoneId]) groupedPrices[price.ZoneId] = [];
//     groupedPrices[price.ZoneId].push(price);
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>

//         {/* TITLE */}
//         <Text style={styles.title}>{p.Description || p.Text1}</Text>

//         {/* DATE */}
//         <View style={styles.row}>
//           <Calendar size={18} color="#666" />
//           <Text style={styles.rowText}>
//             {new Date(p.Date).toLocaleString("en-US", {
//               weekday: "long",
//               month: "long",
//               day: "numeric",
//               year: "numeric",
//               hour: "numeric",
//               minute: "numeric",
//             })}
//           </Text>
//         </View>

//         {/* VENUE */}
//         <View style={styles.row}>
//           <MapPin size={18} color="#666" />
//           <Text style={styles.rowText}>
//             {p.Text3}
//             {"\n"}
//             {p.Text4}
//           </Text>
//         </View>

//         {/* TICKET TYPES & PRICES */}
//         <Text style={styles.sectionTitle}>Ticket Types & Prices</Text>

//         {/* GA (single price) */}
//         {isGA && (
//           <>
//             {details.prices.map((price: any, idx: number) => {
//               const typeLabel = PRICE_TYPES[price.PriceTypeId] ?? `Type ${price.PriceTypeId}`;
//               return (
//                 <View key={idx} style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>{typeLabel}</Text>
//                   <Text style={styles.priceValue}>${price.Price.toFixed(2)}</Text>
//                 </View>
//               );
//             })}

//             {/* BUY BUTTON */}
//             <TouchableOpacity style={styles.buyButton}>
//               <Ticket size={20} color="#FFF" />
//               <Text style={styles.buyButtonText}>Purchase Tickets</Text>
//             </TouchableOpacity>
//           </>
//         )}

//         {/* SYOS (seat selection) */}
//         {!isGA && (
//           <>
//             {/* SHOW PRICES GROUPED BY ZONE */}
//             {Object.keys(groupedPrices).map((zoneId) => (
//               <View key={zoneId} style={styles.zoneBlock}>
//                 <Text style={styles.zoneTitle}>
//                   {zonesMap[zoneId] ?? `Zone ${zoneId}`}
//                 </Text>

//                 {groupedPrices[zoneId].map((price: any, idx: number) => {
//                   const typeLabel =
//                     PRICE_TYPES[price.PriceTypeId] ?? `Type ${price.PriceTypeId}`;
//                   return (
//                     <View key={idx} style={styles.priceRow}>
//                       <Text style={styles.priceLabel}>{typeLabel}</Text>
//                       <Text style={styles.priceValue}>${price.Price.toFixed(2)}</Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             ))}

//             {/* SELECT YOUR OWN SEAT BUTTON */}
//             <TouchableOpacity
//               style={styles.buyButton}
//               onPress={() =>
//                 // router.push(`/seatmap/${id}`) // Create this page next
//                 router.push({
//   pathname: "/seatmap/[id]",
//   params: { id: String(id) }
// })

//               }
//             >
//               <Ticket size={20} color="#FFF" />
//               <Text style={styles.buyButtonText}>Select Your Seat</Text>
//             </TouchableOpacity>
//           </>
//         )}

//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// //
// // STYLES
// //
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFF" },
//   content: { padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

//   title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },

//   row: { flexDirection: "row", marginBottom: 10, gap: 10 },
//   rowText: { fontSize: 16, color: "#444", flex: 1 },

//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginTop: 20,
//     marginBottom: 10,
//     color: "#000",
//   },

//   priceRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 8,
//   },

//   priceLabel: { fontSize: 16, color: "#333" },
//   priceValue: { fontSize: 16, fontWeight: "700", color: "#000" },

//   zoneBlock: {
//     padding: 10,
//     backgroundColor: "#F7F7F7",
//     borderRadius: 8,
//     marginBottom: 15,
//   },

//   zoneTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 5,
//   },

//   buyButton: {
//     backgroundColor: "#000",
//     padding: 15,
//     borderRadius: 8,
//     marginTop: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     gap: 10
//   },

//   buyButtonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
// });















// import { useLocalSearchParams } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import api from "@/services/api";
// import { MapPin, Calendar, Ticket } from "lucide-react-native";

// // CUSTOM PRICE TYPE LABELS (you can adjust these)
// const PRICE_TYPES: any = {
//   223: "Adult",
//   364: "Child / Youth",
//   365: "Senior",
//   500: "Student",
// };

// export default function EventDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const [loading, setLoading] = useState(true);
//   const [details, setDetails] = useState<any>(null);

//   useEffect(() => {
//     loadDetails();
//   }, [id]);

//   const loadDetails = async () => {
//     try {
//       const res = await api.get(`/api/performances/${id}/full`);
//       setDetails(res.data);
//     } catch (e) {
//       console.error("DETAIL LOAD ERROR:", e);
//     }
//     setLoading(false);
//   };

//   if (loading || !details) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8B0000" />
//       </View>
//     );
//   }

//   const p = details.performance;
//   const zoneName = details.zones?.[0]?.Zone?.Description ?? "General Admission";

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>

//         {/* EVENT TITLE */}
//         <Text style={styles.title}>{p.Description || p.Text1}</Text>

//         {/* DATE */}
//         <View style={styles.row}>
//           <Calendar size={18} color="#666" />
//           <Text style={styles.rowText}>
//             {new Date(p.Date).toLocaleString("en-US", {
//               weekday: "long",
//               month: "long",
//               day: "numeric",
//               year: "numeric",
//               hour: "numeric",
//               minute: "numeric",
//             })}
//           </Text>
//         </View>

//         {/* VENUE INFO */}
//         <View style={styles.row}>
//           <MapPin size={18} color="#666" />
//           <Text style={styles.rowText}>
//             {p.Text3}
//             {"\n"}
//             {p.Text4}
//           </Text>
//         </View>

//         {/* TICKET TYPES & PRICES */}
//         <Text style={styles.sectionTitle}>Ticket Types & Prices</Text>

//         {details.prices.map((price: any, idx: number) => {
//           const label = PRICE_TYPES[price.PriceTypeId] ?? `Price Type ${price.PriceTypeId}`;

//           return (
//             <View key={idx} style={styles.priceRow}>
//               <Text style={styles.priceLabel}>{label}</Text>
//               <Text style={styles.priceValue}>${price.Price.toFixed(2)}</Text>
//             </View>
//           );
//         })}

//         {/* ZONE NAME */}
//         <Text style={styles.sectionTitle}>Seating Zone</Text>
//         <Text style={styles.item}>{zoneName}</Text>

//         {/* BUY BUTTON */}
//         <TouchableOpacity style={styles.buyButton}>
//           <Ticket size={20} color="#FFF" />
//           <Text style={styles.buyButtonText}>Purchase Tickets</Text>
//         </TouchableOpacity>

//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFF" },
//   content: { padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

//   title: { fontSize: 28, fontWeight: "700", marginBottom: 16, color: "#000" },

//   row: { flexDirection: "row", marginBottom: 10, gap: 10 },
//   rowText: { fontSize: 16, color: "#444", flex: 1 },

//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#000",
//     marginTop: 22,
//     marginBottom: 10,
//   },

//   priceRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 8,
//   },
//   priceLabel: { fontSize: 16, color: "#333" },
//   priceValue: { fontSize: 16, fontWeight: "700", color: "#000" },

//   item: { fontSize: 16, color: "#444", marginBottom: 6 },

//   buyButton: {
//     backgroundColor: "#000",
//     padding: 15,
//     borderRadius: 8,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 10,
//     marginTop: 30,
//   },
//   buyButtonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
// });













// import { useLocalSearchParams } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import api from '@/services/api';
// import { MapPin, Calendar, Ticket } from 'lucide-react-native';

// export default function EventDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const [loading, setLoading] = useState(true);
//   const [details, setDetails] = useState<any>(null);

//   useEffect(() => {
//     loadDetails();
//   }, [id]);

//   const loadDetails = async () => {
//     try {
//       const res = await api.get(`/api/performances/${id}/full`);
//       setDetails(res.data);
//     } catch (e) {
//       console.error("DETAIL LOAD ERROR:", e);
//     }
//     setLoading(false);
//   };

//   if (loading || !details) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8B0000" />
//       </View>
//     );
//   }

//   const p = details.performance;

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>

//         <Text style={styles.title}>{p.Description || p.Text1}</Text>

//         {/* DATE */}
//         <View style={styles.row}>
//           <Calendar size={18} color="#666" />
//           <Text style={styles.rowText}>
//             {new Date(p.Date).toLocaleString('en-US', {
//               weekday: 'long',
//               month: 'long',
//               day: 'numeric',
//               year: 'numeric',
//               hour: 'numeric',
//               minute: 'numeric'
//             })}
//           </Text>
//         </View>

//         {/* VENUE */}
//         <View style={styles.row}>
//           <MapPin size={18} color="#666" />
//           <Text style={styles.rowText}>
//             {p.Text3 || "Unknown Venue"}
//             {"\n"}
//             {p.Text4 || ""}
//           </Text>
//         </View>

//         {/* PRICES */}
//         <Text style={styles.sectionTitle}>Ticket Types & Prices</Text>
//         {details.prices.map((price: any, idx: number) => (
//           <View key={idx} style={styles.priceRow}>
//             {/* <Text style={styles.priceLabel}>{price.PriceType.Description}</Text> */}
//             <Text style={styles.priceValue}>${price.Price}</Text>
//           </View>
//         ))}

//         {/* BUY BUTTON */}
//         <TouchableOpacity style={styles.buyButton}>
//           <Ticket size={20} color="#FFF" />
//           <Text style={styles.buyButtonText}>Purchase Tickets</Text>
//         </TouchableOpacity>

//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#FFF' },
//   content: { padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   title: { fontSize: 28, fontWeight: '700', marginBottom: 16, color: '#000' },
//   row: { flexDirection: 'row', marginBottom: 10, gap: 10 },
//   rowText: { fontSize: 16, color: '#444', flex: 1 },
//   sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginTop: 20, marginBottom: 10 },
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
//   priceLabel: { fontSize: 16, color: '#333' },
//   priceValue: { fontSize: 16, color: '#000', fontWeight: '700' },
//   buyButton: { backgroundColor: '#000', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30 },
//   buyButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
// });
