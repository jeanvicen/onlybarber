import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandMark } from "../components/BrandMark";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=1200&q=85" }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.top}><BrandMark /></View>
        <View style={styles.content}>
          <Text style={styles.kicker}>CONHECIMENTO DE BARBEIRO PARA BARBEIRO</Text>
          <Text style={styles.title}>Onde todo barbeiro evolui.</Text>
          <Text style={styles.copy}>Cursos, técnicas e uma comunidade inteira dedicada ao seu próximo nível.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Começar agora" onPress={onStart} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonText}>COMEÇAR AGORA  →</Text>
          </Pressable>
          <Text style={styles.footnote}>Feito no Brasil para barbeiros de verdade.</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, minHeight: 720 }, overlay: { flex: 1, padding: spacing.lg, justifyContent: "space-between", backgroundColor: "rgba(7,8,7,0.68)" }, top: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingTop: spacing.lg }, content: { width: "100%", maxWidth: 660, alignSelf: "center", alignItems: "center", paddingBottom: spacing.xxl }, kicker: { color: colors.yellow, fontSize: 11, letterSpacing: 2, fontWeight: "900", textAlign: "center" }, title: { color: colors.text, fontSize: 48, lineHeight: 52, fontWeight: "900", textAlign: "center", marginTop: spacing.md }, copy: { color: "#E2E2DE", fontSize: 17, lineHeight: 25, textAlign: "center", maxWidth: 540, marginTop: spacing.md }, button: { minHeight: 56, justifyContent: "center", backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: spacing.xl, marginTop: spacing.xl }, pressed: { opacity: 0.82 }, buttonText: { color: colors.background, fontWeight: "900", fontSize: 14 }, footnote: { color: colors.muted, fontSize: 11, marginTop: spacing.lg },
});
