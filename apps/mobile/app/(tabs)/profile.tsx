import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export default function ProfileScreen() {
  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>👤</Text>
      <Text style={[styles.title, { color: Colors.light.text }]}>Profile</Text>
      <Text style={[styles.sub, { color: Colors.light.textMuted }]}>Sign in to manage your account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  sub: { fontSize: 13 },
});
