import { View, Text, StyleSheet, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>H</Text>
      </View>
      <Text style={styles.title}>Homeal</Text>
      <Text style={styles.subtitle}>Healthy Food, From Home</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 60,
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "800",
  },
});
