import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { colors } from "../src/theme/colors";

const onlyBarberTheme = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: colors.yellow, background: colors.background, card: colors.background, text: colors.text, border: colors.border } };

export default function RootLayout() {
  return (
    <ThemeProvider value={onlyBarberTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
