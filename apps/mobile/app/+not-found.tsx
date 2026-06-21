import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Página não encontrada" }} />
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Esse corte não existe.</Text>
      <Link href="/" style={styles.link}>Voltar para a Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.background }, code: { color: colors.yellow, fontSize: 64, fontWeight: "900" }, title: { color: colors.text, fontSize: 22, fontWeight: "900" }, link: { color: colors.yellow, fontWeight: "800", marginTop: 12 } });
