import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import api from '@/services/api';
import { Calendar, MapPin, Ticket } from 'lucide-react-native';

export default function EventsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]); // <- Tessitura performance list

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/performances");

      if (Array.isArray(res.data)) {
        setEvents(res.data); // {performanceId, perf}
      }
    } catch (error) {
      console.error("ERROR loading Tessitura events:", error);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // NAVIGATE TO EVENT DETAIL PAGE (you can create it later)
  // const handleBuyTickets = (item: any) => {
  // const id = item.performanceId;
  // router.push(`/show/${id}`); // create this page later
  // };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Buy Tickets</Text>
        <Text style={styles.subtitle}>Active Tessitura Performances</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {events.map((item) => {
          const p = item.perf;

          return (
            <View key={item.performanceId} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.badgeMonth}>
                    {new Date(p.Date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </Text>
                  <Text style={styles.badgeDay}>
                    {new Date(p.Date).getDate()}
                  </Text>
                </View>

                <View style={styles.eventHeaderContent}>
                  <Text style={styles.eventTitle}>
                    {p.Description || p.Text1 || "Untitled Event"}
                  </Text>

                  <View style={styles.infoRow}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.infoText}>
                      {p.Text3 || "Venue not available"}
                    </Text>
                  </View>

                  {p.Text4 && (
                    <View style={styles.infoRow}>
                      <MapPin size={14} color="#666" />
                      <Text style={styles.infoText}>{p.Text4}</Text>
                    </View>
                  )}


                  <View style={styles.infoRow}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.infoText}>
                      {p.Venue?.Description ?? "Unknown Venue"}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.eventDescription}>
                {p.Subtitle ?? p.Description ?? "No event description available."}
              </Text>
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() =>
                  router.push({
                    pathname: "/events/[id]",
                    params: { id: item.performanceId.toString() }
                  })
                }
              >
                <Ticket size={20} color="#FFF" />
                <Text style={styles.buyButtonText}>View Tickets</Text>
              </TouchableOpacity>



              {/* <TouchableOpacity
                style={styles.buyButton}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/events/[id]",
                    params: { id: item.performanceId.toString() }
                  })
                }
              >
                <Ticket size={20} color="#FFF" />
                <Text style={styles.buyButtonText}>View Tickets</Text>
              </TouchableOpacity> */}
            </View>
          );
        })}

        {events.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No performances found</Text>
            <Text style={styles.emptySubtext}>Check back soon for more shows!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventDateBadge: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  badgeMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  badgeDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  eventHeaderContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: 280,
  },
});
















// import { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   RefreshControl,
//   ActivityIndicator,
//   TouchableOpacity,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { Calendar, MapPin, Ticket } from 'lucide-react-native';

// interface Event {
//   id: string;
//   title: string;
//   description: string;
//   event_date: string;
//   venue_name: string;
//   venue_address: string;
//   price_adult: string;
//   price_youth: string;
//   price_senior: string;
//   available_seats: number;
//   status: string;
// }

// export default function EventsScreen() {
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [events, setEvents] = useState<Event[]>([]);

//   useEffect(() => {
//     loadEvents();
//   }, []);

//   const loadEvents = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('events')
//         .select('*')
//         .eq('status', 'active')
//         .order('event_date', { ascending: true });

//       if (error) throw error;
//       if (data) setEvents(data);
//     } catch (error) {
//       console.error('Error loading events:', error);
//     }
//     setLoading(false);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadEvents();
//     setRefreshing(false);
//   };

//   const handleBuyTickets = (event: Event) => {
//     router.push({
//       pathname: '/(tabs)/ticket-details',
//       params: { eventId: event.id },
//     });
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#000000" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Buy Tickets</Text>
//         <Text style={styles.subtitle}>Upcoming performances</Text>
//       </View>

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
//         {events.map((event) => (
//           <View key={event.id} style={styles.eventCard}>
//             <View style={styles.eventHeader}>
//               <View style={styles.eventDateBadge}>
//                 <Text style={styles.badgeMonth}>
//                   {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
//                 </Text>
//                 <Text style={styles.badgeDay}>
//                   {new Date(event.event_date).getDate()}
//                 </Text>
//               </View>
//               <View style={styles.eventHeaderContent}>
//                 <Text style={styles.eventTitle}>{event.title}</Text>
//                 <View style={styles.infoRow}>
//                   <Calendar size={14} color="#666666" />
//                   <Text style={styles.infoText}>
//                     {new Date(event.event_date).toLocaleDateString('en-US', {
//                       weekday: 'long',
//                       month: 'long',
//                       day: 'numeric',
//                       year: 'numeric',
//                     })}
//                   </Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                   <MapPin size={14} color="#666666" />
//                   <Text style={styles.infoText}>{event.venue_name}</Text>
//                 </View>
//               </View>
//             </View>

//             <Text style={styles.eventDescription} numberOfLines={2}>
//               {event.description}
//             </Text>

//             <View style={styles.pricingSection}>
//               <View style={styles.priceRow}>
//                 <Text style={styles.priceLabel}>Adult</Text>
//                 <Text style={styles.priceValue}>${parseFloat(event.price_adult).toFixed(2)}</Text>
//               </View>
//               <View style={styles.priceRow}>
//                 <Text style={styles.priceLabel}>Youth</Text>
//                 <Text style={styles.priceValue}>${parseFloat(event.price_youth).toFixed(2)}</Text>
//               </View>
//               <View style={styles.priceRow}>
//                 <Text style={styles.priceLabel}>Senior</Text>
//                 <Text style={styles.priceValue}>${parseFloat(event.price_senior).toFixed(2)}</Text>
//               </View>
//             </View>

//             <TouchableOpacity
//               style={styles.buyButton}
//               onPress={() => handleBuyTickets(event)}
//               activeOpacity={0.7}
//             >
//               <Ticket size={20} color="#FFFFFF" />
//               <Text style={styles.buyButtonText}>Buy Tickets</Text>
//             </TouchableOpacity>
//           </View>
//         ))}

//         {events.length === 0 && (
//           <View style={styles.emptyState}>
//             <Calendar size={64} color="#CCCCCC" />
//             <Text style={styles.emptyText}>No events available</Text>
//             <Text style={styles.emptySubtext}>Check back soon for upcoming performances</Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F8F8',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F8F8',
//   },
//   header: {
//     backgroundColor: '#FFFFFF',
//     padding: 24,
//     paddingTop: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#000000',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666666',
//     marginTop: 4,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 16,
//   },
//   eventCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E5E5',
//   },
//   eventHeader: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   eventDateBadge: {
//     width: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     padding: 8,
//     marginRight: 16,
//   },
//   badgeMonth: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#666666',
//   },
//   badgeDay: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#000000',
//   },
//   eventHeaderContent: {
//     flex: 1,
//   },
//   eventTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000000',
//     marginBottom: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//     gap: 6,
//   },
//   infoText: {
//     fontSize: 13,
//     color: '#666666',
//     flex: 1,
//   },
//   eventDescription: {
//     fontSize: 14,
//     color: '#666666',
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   pricingSection: {
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: '#666666',
//   },
//   priceValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000000',
//   },
//   buyButton: {
//     backgroundColor: '#000000',
//     borderRadius: 8,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//   },
//   buyButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyState: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#666666',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999999',
//     textAlign: 'center',
//     maxWidth: 280,
//   },
// });
