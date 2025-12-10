import { Tabs } from 'expo-router';
import { Home, Ticket, User, MessageCircle } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e5e5',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ size, color }) => <Ticket size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Support',
          tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />

      {/* HIDE all non-tab pages */}
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="events/index" options={{ href: null }} />
      <Tabs.Screen name="events/[id]" options={{ href: null }} />
      <Tabs.Screen name="make-donation" options={{ href: null }} />
      <Tabs.Screen name="ticket-details" options={{ href: null }} />
      <Tabs.Screen name="donations" options={{ href: null }} />
    </Tabs>
  );
}














// import { Tabs } from 'expo-router';
// import { Home, Ticket, User, MessageCircle } from 'lucide-react-native';

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: '#000000',
//         tabBarInactiveTintColor: '#999999',
//         tabBarStyle: {
//           backgroundColor: '#FFFFFF',
//           borderTopColor: '#E5E5E5',
//           borderTopWidth: 1,
//           height: 60,
//           paddingBottom: 8,
//           paddingTop: 8,
//         },
//         tabBarLabelStyle: {
//           fontSize: 11,
//           fontWeight: '600',
//         },
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="tickets"
//         options={{
//           title: 'Tickets',
//           tabBarIcon: ({ size, color }) => <Ticket size={size} color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="chat"
//         options={{
//           title: 'Support',
//           tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="account"
//         options={{
//           title: 'Account',
//           tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="donations"
//         options={{
//           href: null,
//         }}
//       />
//       <Tabs.Screen
//         name="events"
//         options={{
//           href: null,
//         }}
//       />
//       <Tabs.Screen
//         name="ticket-details"
//         options={{
//           href: null,
//         }}
//       />
//       <Tabs.Screen
//         name="make-donation"
//         options={{
//           href: null,
//         }}
//       />
//     </Tabs>
//   );
// }
