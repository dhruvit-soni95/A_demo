import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from "react-native";
import api from "@/services/api";

function safeGet(obj: any, paths: string[], fallback?: any) {
  for (const p of paths) {
    const keys = p.split(".");
    let cur = obj;
    let ok = true;
    for (const k of keys) {
      if (cur == null) { ok = false; break; }
      cur = cur[k];
    }
    if (ok && cur !== undefined) return cur;
  }
  return fallback;
}

function formatMoney(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export default function CartPage() {
  const { id } = useLocalSearchParams();   // cartId passed from Add to Cart
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any>(null);
  const [cartExpired, setCartExpired] = useState(false);


  // useEffect(() => {
  //   if (id) loadCart();
  // }, [id]);
  useEffect(() => {
    if (id) {
      console.log("CartPage received ID:", id);
      loadCart();
    }
  }, [id]);

  // // ---- helper to normalize expo-router params ----
  // function normalizeParam(p: string | string[] | undefined): string | undefined {
  //   if (!p) return undefined;
  //   return Array.isArray(p) ? p[0] : p;
  // }

  // const loadCart = async () => {
  //   setLoading(true);
  //   try {
  //     // read token & saved cartId
  //     const token = await SecureStore.getItemAsync("token");
  //     let cartId = await SecureStore.getItemAsync("cartId");

  //     const headers = token ? { Authorization: `Bearer ${token}` } : {};

  //     // if no cartId saved, call server ensure endpoint to create one
  //     if (!cartId) {
  //       console.log("No saved cartId → asking server to ensure a session");
  //       const ensureRes = await api.get("/api/cart/ensure", { headers });
  //       if (ensureRes.data?.cartId) {
  //         cartId = ensureRes.data.cartId;
  //         if (cartId) {
  //   await SecureStore.setItemAsync("cartId", cartId);
  // }

  //         // await SecureStore.setItemAsync("cartId", cartId);
  //       } else {
  //         console.warn("cart ensure returned no cartId", ensureRes.data);
  //       }
  //     }

  //     if (!cartId) {
  //       throw new Error("No cartId available");
  //     }

  //     // Save locally (if not already)
  //     await SecureStore.setItemAsync("cartId", cartId);

  //     // Request cart
  //     const res = await api.get(`/api/cart/${cartId}`, { headers });

  //     // If server says expired → replace and re-load
  //     if (res.data?.expired && res.data?.newCartId) {
  //       console.log("Cart expired, replacing with newCartId:", res.data.newCartId);
  //       await SecureStore.setItemAsync("cartId", res.data.newCartId);
  //       // reload using new id (do NOT infinite loop because server will return real cart or error)
  //       return loadCart();
  //     }

  //     // If server accidentally returned null/empty, clear stored cartId and create new
  //     if (!res.data || (typeof res.data === "object" && Object.keys(res.data).length === 0)) {
  //       console.warn("Cart response empty — clearing cartId and ensuring new cart");
  //       await SecureStore.deleteItemAsync("cartId");
  //       const ensureRes2 = await api.get("/api/cart/ensure", { headers });
  //       if (ensureRes2.data?.cartId) {
  //         await SecureStore.setItemAsync("cartId", ensureRes2.data.cartId);
  //         return loadCart();
  //       }
  //       throw new Error("Empty cart and unable to create new one");
  //     }

  //     setCart(res.data);
  //     console.log("CART SUCCESS:", res.data);
  //   } catch (err: any) {
  //     console.log("LOAD CART ERROR", err.response?.data || err.message || err);
  //     Alert.alert("Error", "Unable to load cart (will try to recover).");

  //     // Try a quick fallback to ensure endpoint to recover
  //     try {
  //       const token = await SecureStore.getItemAsync("token");
  //       const headers = token ? { Authorization: `Bearer ${token}` } : {};
  //       const ensureRes = await api.get("/api/cart/ensure", { headers });
  //       if (ensureRes.data?.cartId) {
  //         await SecureStore.setItemAsync("cartId", ensureRes.data.cartId);
  //         // reload once
  //         await loadCart();
  //         return;
  //       }
  //     } catch (e) {
  //       console.warn("Fallback ensure failed:", e);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // const loadCart = async () => {
  //   setLoading(true);

  //   try {
  //     const token = await SecureStore.getItemAsync("token");

  //     const headers = { Authorization: `Bearer ${token}` };

  //     const res = await api.get(`/api/cart/${id}`, { headers });

  //     // HANDLE EXPIRED CART
  //     if (res.data?.expired) {
  //       console.log("Cart expired → replacing with new cartId", res.data.newCartId);

  //       await SecureStore.setItemAsync("cartId", res.data.newCartId);

  //       // Refresh the local route param if needed
  //       router.push(`/cart/${res.data.newCartId}`);

  //       return; // END — avoid infinite loop
  //     }

  //     setCart(res.data);
  //     console.log("CART SUCCESS:", res.data);

  //   } catch (err: any) {
  //     console.log("LOAD CART ERROR", err.response?.data || err.message);
  //     Alert.alert("Error", "Unable to load cart");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // const loadCart = async () => {
  //   try {
  //     setLoading(true);

  //     const token = await SecureStore.getItemAsync("token");
  //     const headers = token ? { Authorization: `Bearer ${token}` } : {};

  //     const res = await api.get(`/api/cart/${id}`, { headers });

  //     // --------------------------------------------------------
  //     // 🔥 HANDLE EXPIRED CART — Backend returned newSessionKey
  //     // --------------------------------------------------------
  //     if (res.data?.expired) {
  //       console.log("🛑 Cart expired → switching to new cart:", res.data.newCartId);

  //       // Clear old cart instantly to avoid flicker
  //       setCart(null);

  //       // Save new cartId
  //       await SecureStore.setItemAsync("cartId", res.data.newCartId);

  //       // Navigate to new cart page
  //       router.replace(`/cart/${res.data.newCartId}`);

  //       return; // very important → stop execution
  //     }

  //     // --------------------------------------------------------
  //     // SUCCESS — Update cart object
  //     // --------------------------------------------------------
  //     setCart(res.data);
  //     console.log("CART LOADED:", res.data);

  //   } catch (err:any) {
  //     console.log("LOAD CART ERROR", err.response?.data || err.message);
  //     Alert.alert("Error", "Unable to load cart");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const loadCart = async () => {
    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.get(`/api/cart/${id}`, { headers });

      // 1️⃣ Tessitura reported expired → switch carts
      if (res.data?.expired) {
        console.log("🛑 Cart expired → switching to new cart:", res.data.newCartId);

        setCart(null);              // clear UI
        setCartExpired(true);       // show message

        await SecureStore.setItemAsync("cartId", res.data.newCartId);
        router.replace(`/cart/${res.data.newCartId}`);

        return;
      }

      // 2️⃣ New cart but EMPTY (null or empty arrays)
      if (!res.data || Object.keys(res.data).length === 0) {
        console.log("⚠ New cart is empty (normal after expiration)");
        setCart(null);
        setCartExpired(true);
        return;
      }

      // 3️⃣ Loaded normally
      setCart(res.data);
      setCartExpired(false);
      console.log("CART LOADED:", res.data);

    } catch (err: any) {
      console.log("LOAD CART ERROR", err.response?.data || err.message);
      Alert.alert("Error", "Unable to load cart");
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!cart) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18 }}>No cart found.</Text>
      </View>
    );
  }

  const items =
    cart.Items ??
    cart.LineItems ??
    cart.Products ??
    (Array.isArray(cart.Items?.Item) ? cart.Items.Item : []) ??
    [];

  const subtotal =
    safeGet(cart, ["SubTotal", "Totals.SubTotal", "Amount.Subtotal"], 0);

  // const fees =
  //   safeGet(cart, ["Fees", "Totals.Fees"], 0);
  const getFees = (cart: any) => {
    // First: Cart-level fees
    const fee1 = safeGet(cart, ["FeesAmount", "Totals.Fees"], null);
    if (fee1 !== null) return fee1;

    // Second: OrderFees array
    const orderFees = safeGet(cart, ["OrderFees"], null);
    if (Array.isArray(orderFees) && orderFees.length > 0) {
      return orderFees.reduce((sum, f) => sum + (f.Amount || 0), 0);
    }

    // Third: SubLineItemFees (per item)
    const products = cart.Products || [];
    let totalFees = 0;

    products.forEach((p: any) => {
      const subItems = p.Performance?.LineItem?.SubLineItems || [];
      subItems.forEach((s: any) => {
        const feeItems = s.SubLineItemFees || [];
        feeItems.forEach((fee: any) => {
          totalFees += fee.Amount || 0;
        });
      });
    });

    return totalFees;
  };

  const fees = getFees(cart);

  const total =
    safeGet(cart, ["Total", "Totals.Total", "Amount.Total"], subtotal + fees);

  // const getItemTitle = (item: any) =>
  //   safeGet(item, [
  //     "Performance.Description",
  //     "ProductName",
  //     "Description",
  //     "Title"
  //   ], "Untitled Event");
  const getItemTitle = (item: any) =>
    safeGet(item, [
      "Performance.Description",
      "Performance.LineItem.Performance.Description",
      "Performance.LineItem.Description",
      "ProductName",
      "Description"
    ], "Untitled Event");


  const getLineItemId = (item: any) =>
    safeGet(item, [
      "Performance.LineItem.Id",
      "LineItem.Id",
      "Id"
    ]);


  // const getItemDate = (item: any) => {
  //   const date =
  //     safeGet(item, [
  //       "Performance.Date",
  //       "Performance.PerformanceDateTime",
  //       "PerfDate"
  //     ]);
  //   if (!date) return "Unknown date";
  //   const d = new Date(date);
  //   return d.toLocaleString();
  // };
  const getItemDate = (item: any) => {
    const date = safeGet(item, [
      "Performance.PerformanceDateTime",
      "Performance.Date",
      "Performance.LineItem.Performance.PerformanceDateTime"
    ]);

    if (!date) return "Unknown date";
    return new Date(date).toLocaleString();
  };

  // const getItemQty = (item: any) =>
  //   safeGet(item, ["Quantity", "NumberOfSeats"], 1);
  const getItemQty = (item: any) => {
    const subs = safeGet(item, [
      "Performance.LineItem.SubLineItems",
      "SubLineItems"
    ], []);

    return Array.isArray(subs) ? subs.length : 1;
  };



  const getItemPrice = (item: any) => {
    return safeGet(item, [
      "Performance.LineItem.SubLineItems.0.SubLineItemDetails.0.OriginalPrice",
      "Performance.LineItem.SubLineItems.0.DueAmount",
      "Price.Value"
    ], 0);
  };

  // const getItemPrice = (item: any) =>
  //   safeGet(item, ["Price.Value", "Amount.Value", "PricePaid"], 0);

  const getItemDetail = (item: any) =>
    safeGet(item, ["Zone.Description", "PriceType.Description"], "");


  const getSubLineItemId = (item: any) => {
    // Each ticket = ONE SubLineItem
    const sub = item?.Performance?.LineItem?.SubLineItems?.[0];
    return sub?.Id;
  };


  const removeItem = async (lineItemId: number, subLineItemId: number) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const res = await api.delete(`/api/cart/${id}/remove/${lineItemId}/${subLineItemId}`, {
        // const res = await api.delete(`/api/cart/${id}/remove/${subLineItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("REMOVE RESULT:", res.data);

      // EXPIRED CART → replace cartId and reload
      if (res.data?.expired) {
        console.log("Cart expired → updating cartId…");

        await SecureStore.setItemAsync("cartId", res.data.newCartId);

        router.replace(`/cart/${res.data.newCartId}`);
        return;
      }

      if (res.data.success) {
        loadCart(); // reload updated cart
      }

    } catch (err: any) {
      console.log("REMOVE ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Unable to remove item.");
    }
  };




  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {cartExpired && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            Your cart session has expired
          </Text>
          <Text style={{ color: "#666", textAlign: "center" }}>
            Seats could not be held anymore.
            Please add your tickets again.
          </Text>
        </View>
      )}


      {items.map((item: any, index: number) => (
        <View key={index} style={styles.item}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.itemTitle}>{getItemTitle(item)}</Text>

            <TouchableOpacity
              // onPress={() => removeItem(item.Performance.LineItem.Id)}
              // onPress={() => removeItem(getSubLineItemId(item))}
              onPress={() =>
                removeItem(
                  item.Performance.LineItem.Id,                       // lineItemId
                  item.Performance.LineItem.SubLineItems[0].Id        // subLineItemId
                )
              }

              style={{ padding: 8, backgroundColor: "red", borderRadius: 6 }}
            >
              <Text style={{ color: "white" }}>Remove</Text>
            </TouchableOpacity>

          </View>
          {/* <Text style={styles.itemTitle}>{getItemTitle(item)}</Text> */}
          <Text style={styles.itemDate}>{getItemDate(item)}</Text>
          <Text style={styles.itemDetail}>{getItemDetail(item)}</Text>
          <Text style={styles.itemQty}>Qty: {getItemQty(item)}</Text>
          <Text style={styles.itemPrice}>Price: ${formatMoney(getItemPrice(item))}</Text>
          {/* <TouchableOpacity
            onPress={() => handleRemove(item)}
            style={styles.removeBtn}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity> */}
        </View>
      ))}

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Subtotal: ${formatMoney(subtotal)}</Text>
        <Text style={styles.summaryText}>Fees: ${formatMoney(fees)}</Text>
        <Text style={styles.summaryTotal}>Total: ${formatMoney(total)}</Text>
      </View>

      {/* <TouchableOpacity
        style={styles.checkoutBtn}
        onPress={() => router.push(`/cart/payment?id=${id}`)}
      >
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.checkoutBtn}
        onPress={() => router.push(`/checkout/checkout?id=${id}`)}
      >
        <Text style={styles.checkoutText}>Checkout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => router.push(`/events`)}
      >
        <Text style={styles.continueText}>Continue Booking...</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff"},
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20, marginTop: 50, textAlign: "center", justifyContent: "center", backgroundColor: "#000000", color: "#ffffff", padding: 10, borderRadius: 8 },

  removeBtn: {
    marginTop: 10,
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  removeText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center"
  },


  // Items
  item: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 12
  },
  itemTitle: { fontSize: 18, fontWeight: "600" },
  itemDate: { fontSize: 14, color: "#555", marginTop: 6 },
  itemDetail: { fontSize: 14, marginTop: 6, color: "#666" },
  itemQty: { fontSize: 14, marginTop: 6 },
  itemPrice: { fontSize: 16, fontWeight: "700", marginTop: 6 },

  // Summary
  summary: { marginTop: 25, borderTopWidth: 1, borderColor: "#ddd", paddingTop: 15 },
  summaryText: { fontSize: 16 },
  summaryTotal: { fontSize: 20, fontWeight: "700", marginTop: 10 },

  checkoutBtn: {
    marginTop: 25,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  continueBtn: {
    marginTop: 25,
    marginBottom: 50,
    backgroundColor: "#48464613",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  continueText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});






























// // app/cart/index.tsx (or wherever your CartPage lives)
// import { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
//   Alert
// } from "react-native";
// import { useRouter } from "expo-router";
// import api from "@/services/api";

// function safeGet<T = any>(obj: any, paths: string[], fallback?: T): T | undefined {
//   for (const p of paths) {
//     const parts = p.split(".");
//     let cur = obj;
//     let ok = true;
//     for (const part of parts) {
//       if (cur == null) { ok = false; break; }
//       cur = cur[part];
//     }
//     if (ok && cur !== undefined) return cur;
//   }
//   return fallback;
// }

// function formatMoney(v: any) {
//   if (v == null) return "0.00";
//   const n = Number(v);
//   if (Number.isNaN(n)) return "0.00";
//   return n.toFixed(2);
// }

// export default function CartPage() {
//   const [loading, setLoading] = useState(true);
//   const [cart, setCart] = useState<any>(null);
//   const router = useRouter();

//   useEffect(() => {
//     loadCart();
//   }, []);

//   const loadCart = async () => {
//     setLoading(true);
//     try {
//       // New server uses /api/cart (no cartId). It should return Tessitura cart object.
//       const res = await api.get("/api/cart");
//       setCart(res.data);
//     } catch (err: any) {
//       console.error("LOAD CART ERROR:", err?.response?.data ?? err?.message ?? err);
//       // Show empty cart shape so UI continues to work
//       setCart(null);
//       Alert.alert("Unable to load cart", "Check logs for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   // Determine items array — support several shapes returned by Tessitura:
//   // Prefer: cart.Items, cart.Products, cart.LineItems, cart.Items?.Item
//   const items: any[] =
//     cart?.Items ??
//     cart?.Products ??
//     cart?.LineItems ??
//     (Array.isArray(cart?.Items?.Item) ? cart.Items.Item : []) ??
//     [];

//   // Fallback totals using many possible keys
//   const subtotal =
//     safeGet(cart, ["SubTotal", "Subtotal", "Totals.SubTotal", "Totals?.SubTotal"], 0) ??
//     safeGet(cart, ["SubTotalAmount", "Amount.Subtotal"], 0);

//   const fees =
//     safeGet(cart, ["FeesAmount", "Fees.Amount", "Fees", "Totals.Fees"], 0) ??
//     0;

//   const total =
//     safeGet(cart, ["CartAmount", "Total", "Totals.Total", "Amount.Total"], 0) ??
//     Number(subtotal) + Number(fees);

//   // Helper to extract title, date and price with many fallbacks
//   const getItemTitle = (item: any) =>
//     safeGet(item, [
//       "Performance.Description",
//       "Performance.Name",
//       "Description",
//       "ProductName",
//       "Title",
//       "Performance.Text1",
//       "PerformanceDetail.Description"
//     ], "Untitled Event");

//   const getItemDateString = (item: any) => {
//     const dateStr =
//       safeGet(item, [
//         "Performance.Date",
//         "Performance.PerformanceDateTime",
//         "Performance.PerformanceDate",
//         "PerformanceDetail.PerformanceDateTime",
//         "Date",
//         "PerfDate",
//         "Performance.PublishWebApiStartDate"
//       ], null);

//     if (!dateStr) return "Unknown Date";
//     try {
//       const d = new Date(dateStr);
//       if (isNaN(d.getTime())) return "Invalid Date";
//       return d.toLocaleString();
//     } catch {
//       return String(dateStr);
//     }
//   };

//   const getItemPrice = (item: any) => {
//     const possible =
//       safeGet(item, [
//         "Price.Value",
//         "Price.Amount",
//         "Amount.Value",
//         "Amount",
//         "UnitPrice",
//         "PricePaid",
//         "LineItem.Price",
//         "PricePaid.Value"
//       ], null);
//     if (possible == null) return null;
//     const n = Number(possible);
//     return Number.isFinite(n) ? n.toFixed(2) : null;
//   };

//   // Quantity fallback
//   const getItemQty = (item: any) =>
//     safeGet(item, ["Quantity", "NumberOfSeats", "Qty"], 1) ?? 1;

//   // Zone/seat/price descriptions
//   const getItemDetailLine = (item: any) =>
//     safeGet(item, [
//       "Zone.Description",
//       "ZoneName",
//       "SeatInfo",
//       "SeatDescription",
//       "PriceType.Description",
//       "PriceTypeName"
//     ], "");

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       <Text style={styles.title}>Your Cart</Text>

//       {items.length === 0 ? (
//         <Text style={styles.empty}>Your cart is empty.</Text>
//       ) : (
//         items.map((item: any, index: number) => {
//           const title = getItemTitle(item);
//           const dateText = getItemDateString(item);
//           const price = getItemPrice(item);
//           const qty = getItemQty(item);
//           const detailLine = getItemDetailLine(item);

//           return (
//             <View key={index} style={styles.item}>
//               <Text style={styles.itemTitle}>{title}</Text>

//               <Text style={styles.itemDate}>{dateText}</Text>

//               {detailLine ? <Text style={styles.itemDetail}>{detailLine}</Text> : null}

//               <Text style={styles.itemQty}>Qty: {qty}</Text>

//               <Text style={styles.itemPrice}>
//                 Price: ${price ?? "N/A"}
//               </Text>
//             </View>
//           );
//         })
//       )}

//       {/* Summary block */}
//       <View style={styles.summary}>
//         <Text style={styles.summaryText}>Subtotal: ${formatMoney(subtotal)}</Text>
//         <Text style={styles.summaryText}>Fees: ${formatMoney(fees)}</Text>
//         <Text style={styles.summaryTotal}>Total: ${formatMoney(total)}</Text>
//       </View>

//       <TouchableOpacity
//         style={styles.checkoutBtn}
//         onPress={() => router.push("/cart/payment")}
//         disabled={items.length === 0}
//       >
//         <Text style={styles.checkoutText}>Proceed to Checkout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", flex: 1 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
//   empty: { textAlign: "center", fontSize: 16, color: "#666", marginTop: 40 },

//   item: {
//     padding: 15,
//     borderRadius: 8,
//     backgroundColor: "#f6f6f6",
//     marginBottom: 12,
//   },
//   itemTitle: { fontSize: 18, fontWeight: "700" },
//   itemDate: { fontSize: 14, color: "#555", marginTop: 6 },
//   itemDetail: { fontSize: 14, color: "#666", marginTop: 6 },
//   itemQty: { fontSize: 14, color: "#333", marginTop: 6 },
//   itemPrice: { fontSize: 16, fontWeight: "600", marginTop: 6 },

//   summary: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderColor: "#ddd" },
//   summaryText: { fontSize: 16, marginBottom: 6 },
//   summaryTotal: { fontSize: 20, fontWeight: "700", marginTop: 10 },

//   checkoutBtn: {
//     marginTop: 20,
//     backgroundColor: "#000",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   checkoutText: { color: "#fff", fontSize: 18, fontWeight: "700" },
// });