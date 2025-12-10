import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import api from "@/services/api";

export default function SeatMapScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [seatMap, setSeatMap] = useState<any>([]);
  const [sections, setSections] = useState<any>([]);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);

  useEffect(() => {
    loadSeats();
  }, [id]);

  const loadSeats = async () => {
    try {
      const res = await api.get(`/api/seatmap/${id}`);
      setSeatMap(res.data.seatMap);
      setSections(res.data.sectionSummary);
    } catch (e) {
      console.log("SEATMAP LOAD ERROR:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Select Your Seat</Text>

      {/* -------------------- Section List -------------------- */}
      <Text style={styles.sectionTitle}>Zones / Sections</Text>

      {sections.map((sec: any) => (
        <View key={sec.Id} style={styles.sectionRow}>
          <Text style={styles.sectionName}>{sec.Zone.Description}</Text>
          <Text style={styles.sectionSeats}>{sec.AvailableCount} available</Text>
        </View>
      ))}

      {/* -------------------- Seat Map Grid -------------------- */}
      <Text style={styles.sectionTitle}>Seat Map</Text>

      {seatMap.map((row: any) => (
        <View key={row.Row} style={styles.row}>
          {row.Seats.map((seat: any) => {
            const isAvailable = seat.Status === "Available";
            const isSelected = selectedSeat?.SeatId === seat.SeatId;

            return (
              <TouchableOpacity
                key={seat.SeatId}
                onPress={() => isAvailable && setSelectedSeat(seat)}
                style={[
                  styles.seat,
                  !isAvailable && styles.seatUnavailable,
                  isSelected && styles.seatSelected,
                ]}
              >
                <Text style={styles.seatText}>{seat.Number}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* -------------------- Selected Seat Panel -------------------- */}
      {selectedSeat && (
        <View style={styles.bottomBar}>
          <Text style={styles.selectedText}>
            Selected: Row {selectedSeat.Row} – Seat {selectedSeat.Number}
          </Text>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6
  },

  sectionName: { fontSize: 16, color: "#222" },
  sectionSeats: { fontSize: 16, color: "#666" },

  row: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap"
  },

  seat: {
    width: 32,
    height: 32,
    margin: 4,
    backgroundColor: "#d7d7d7",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  },

  seatUnavailable: {
    backgroundColor: "#999"
  },

  seatSelected: {
    backgroundColor: "#000"
  },

  seatText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12
  },

  bottomBar: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#000",
    borderRadius: 10
  },

  selectedText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10
  },

  addButton: {
    backgroundColor: "#8B0000",
    paddingVertical: 12,
    borderRadius: 8
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
  }
});
