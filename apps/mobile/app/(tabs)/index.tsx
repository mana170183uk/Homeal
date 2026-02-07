import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Colors } from "@/constants/theme";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan"];

export default function HomeScreen() {
  const t = Colors.light;

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSmall, { color: t.textMuted }]}>Deliver to</Text>
          <Text style={[styles.headerTitle, { color: t.text }]}>Home - Sector 15</Text>
        </View>
        <View style={[styles.logoBox, { backgroundColor: t.primary }]}>
          <Text style={styles.logoText}>H</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: t.input, borderColor: t.border }]}>
        <Text style={[styles.searchText, { color: t.textMuted }]}>Search dishes, chefs...</Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {CATEGORIES.map((cat, i) => (
          <Pressable
            key={i}
            style={[
              styles.chip,
              i === 0
                ? { backgroundColor: t.primary }
                : { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.chipText, { color: i === 0 ? "#fff" : t.textSoft }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: t.primary }]}>
        <Text style={styles.bannerTitle}>30% OFF First Meal</Text>
        <Text style={styles.bannerSub}>Fresh, healthy & made with love</Text>
        <Pressable style={styles.bannerBtn}>
          <Text style={[styles.bannerBtnText, { color: t.primary }]}>Order Now</Text>
        </Pressable>
      </View>

      {/* Nearby Chefs */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Nearby Chefs</Text>
        <Text style={[styles.seeAll, { color: t.primary }]}>See All</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>👩‍🍳</Text>
        <Text style={[styles.emptyText, { color: t.textMuted }]}>
          No chefs nearby yet. Check back soon!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerSmall: { fontSize: 10 },
  headerTitle: { fontSize: 14, fontWeight: "800" },
  logoBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  searchBar: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchText: { fontSize: 12 },
  categories: { paddingHorizontal: 16, marginBottom: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: "700" },
  banner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 18, fontWeight: "900", color: "#fff", marginBottom: 4 },
  bannerSub: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 14 },
  bannerBtn: { backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, alignSelf: "flex-start" },
  bannerBtnText: { fontSize: 12, fontWeight: "800" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  seeAll: { fontSize: 12, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 13 },
});
