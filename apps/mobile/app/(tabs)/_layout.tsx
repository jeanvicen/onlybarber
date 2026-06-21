import { Tabs } from "expo-router";
import { StyleSheet, Text, useWindowDimensions } from "react-native";
import { colors } from "../../src/theme/colors";

const icons: Record<string, string> = { index: "⌂", search: "⌕", library: "▤", community: "♟", studio: "✦" };

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarPosition: desktop ? "left" : "bottom",
      tabBarVariant: desktop ? "material" : "uikit",
      tabBarLabelPosition: desktop ? "beside-icon" : "below-icon",
      tabBarActiveTintColor: colors.yellow,
      tabBarInactiveTintColor: colors.muted,
      tabBarActiveBackgroundColor: desktop ? colors.surfaceElevated : colors.background,
      tabBarStyle: [styles.bar, desktop && styles.sidebar],
      tabBarLabelStyle: styles.label,
      sceneStyle: { backgroundColor: colors.background },
      tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>{icons[route.name] ?? "•"}</Text>,
    })}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Buscar" }} />
      <Tabs.Screen name="library" options={{ title: "Cursos" }} />
      <Tabs.Screen name="community" options={{ title: "Comunidade" }} />
      <Tabs.Screen name="studio" options={{ title: "Studio" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({ bar: { backgroundColor: colors.background, borderColor: colors.border }, sidebar: { width: 230 }, label: { fontSize: 11, fontWeight: "800" }, icon: { fontSize: 21, fontWeight: "900" } });
