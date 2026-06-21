import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenState } from "../components/ScreenState";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

export function SimpleScreen({ kind }: { kind: "search" | "library" | "community" }) {
  const content = {
    search: ["Buscar cursos", "Encontre por técnica, instrutor ou nível."],
    library: ["Meus cursos", "Continue aprendendo de onde parou."],
    community: ["Comunidade", "Trabalhos, dúvidas e evolução de barbeiro para barbeiro."],
  }[kind];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>ONLY BARBER</Text><Text style={styles.title}>{content[0]}</Text><Text style={styles.subtitle}>{content[1]}</Text>
      {kind === "search" ? <><TextInput accessibilityLabel="Buscar cursos" placeholder="Ex.: degradê americano" placeholderTextColor={colors.muted} style={styles.input} /><View style={styles.chips}>{["Degradê", "Barba", "Coloração", "Iniciante"].map((chip) => <Pressable key={chip} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></Pressable>)}</View><ScreenState state="empty" title="Comece sua busca" description="Os melhores cursos do universo da barbearia estão aqui." /></> : null}
      {kind === "library" ? <View style={styles.learning}><Text style={styles.learningLabel}>EM ANDAMENTO</Text><Text style={styles.learningTitle}>Degradê americano completo</Text><View style={styles.track}><View style={styles.fill} /></View><Text style={styles.progress}>68% · Retomar aula 8</Text></View> : null}
      {kind === "community" ? ["Meu primeiro low fade. O que vocês melhorariam?", "Qual máquina entrega a transição mais limpa?", "Antes e depois: 30 dias praticando barba"].map((post, index) => <View key={post} style={styles.post}><View style={styles.avatar}><Text style={styles.avatarText}>{["RV", "MS", "AL"][index]}</Text></View><View style={styles.postBody}><Text style={styles.postText}>{post}</Text><Text style={styles.postMeta}>♥ {24 + index * 17}   ·   {6 + index} comentários</Text></View></View>) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { width: "100%", maxWidth: 1100, alignSelf: "center", padding: spacing.lg, paddingBottom: 110 }, kicker: { color: colors.yellow, fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: spacing.md }, title: { color: colors.text, fontSize: 36, fontWeight: "900", marginTop: 6 }, subtitle: { color: colors.muted, fontSize: 15, marginTop: 6, marginBottom: spacing.xl }, input: { minHeight: 56, color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.lg, fontSize: 16 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: spacing.lg }, chip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }, chipText: { color: colors.text, fontWeight: "700" }, learning: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 12 }, learningLabel: { color: colors.yellow, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }, learningTitle: { color: colors.text, fontSize: 22, fontWeight: "900" }, track: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden" }, fill: { width: "68%", height: 8, backgroundColor: colors.yellow }, progress: { color: colors.muted }, post: { flexDirection: "row", gap: spacing.md, padding: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }, avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" }, avatarText: { color: colors.background, fontWeight: "900" }, postBody: { flex: 1, gap: 12 }, postText: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: "700" }, postMeta: { color: colors.muted, fontSize: 12 } });
