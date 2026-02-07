import { Tabs } from "expo-router";
import { Colors } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.light.card,
          borderTopColor: Colors.light.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: "Explore", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: "Cart", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Orders", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
