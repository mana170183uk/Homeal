import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export default function ExploreScreen() {
  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <Text style={[styles.title, { color: Colors.light.text }]}>Explore</Text>
      <Text style={[styles.sub, { color: Colors.light.textMuted }]}>Discover chefs and cuisines near you</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  sub: { fontSize: 13, textAlign: "center" },
});
