import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

const lessons = ["Preparação e ferramentas", "Primeira marcação", "Removendo a linha base", "Alavanca e meio pente", "Construindo peso", "Tesoura sobre pente", "Refinando sombras", "Construindo a transição", "Acabamento e fotografia"];

export function LearningScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <View style={[styles.screen, desktop && styles.desktop]}>
      <View style={styles.main}>
        <View style={styles.video}><View style={styles.videoBadge}><Text style={styles.videoBadgeText}>AULA 8 DE 12</Text></View><Text style={styles.videoIcon}>▶</Text><Text style={styles.videoHint}>Player seguro · velocidade · legendas</Text></View>
        <ScrollView contentContainerStyle={styles.lessonContent}>
          <Text style={styles.kicker}>MÓDULO 2 · CONSTRUINDO O DEGRADÊ</Text>
          <Text style={styles.title}>Aula 8 · Construindo a transição</Text>
          <Text style={styles.copy}>Agora conectamos as áreas sem apagar o contraste. Observe a pressão da máquina e trabalhe sempre em movimentos curtos.</Text>
          <View style={styles.actions}><Pressable style={styles.secondary}><Text style={styles.secondaryText}>＋ ADICIONAR NOTA</Text></Pressable><Pressable style={styles.primary}><Text style={styles.primaryText}>MARCAR COMO CONCLUÍDA</Text></Pressable></View>
        </ScrollView>
      </View>
      <View style={[styles.sidebar, !desktop && styles.sidebarMobile]}>
        <View style={styles.progressHeader}><View><Text style={styles.progressTitle}>Seu progresso</Text><Text style={styles.progressValue}>68% concluído</Text></View><Text style={styles.trophy}>★</Text></View>
        <View style={styles.track}><View style={styles.fill} /></View>
        <ScrollView style={styles.list}>{lessons.map((lesson, index) => <Pressable accessibilityRole="button" accessibilityLabel={`Abrir aula ${index + 1}: ${lesson}`} key={lesson} style={[styles.lesson, index === 7 && styles.lessonActive]}><View style={[styles.lessonState, index < 7 && styles.lessonDone]}><Text style={styles.lessonStateText}>{index < 7 ? "✓" : index + 1}</Text></View><View style={styles.lessonText}><Text style={[styles.lessonName, index === 7 && styles.lessonNameActive]}>{lesson}</Text><Text style={styles.lessonMeta}>{8 + index * 2} min</Text></View></Pressable>)}</ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, desktop: { flexDirection: "row" }, main: { flex: 1 }, video: { minHeight: 360, flex: 1, backgroundColor: "#050605", alignItems: "center", justifyContent: "center", gap: 18 }, videoBadge: { position: "absolute", top: spacing.lg, left: spacing.lg, backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 }, videoBadgeText: { color: colors.background, fontSize: 10, fontWeight: "900" }, videoIcon: { color: colors.yellow, fontSize: 56 }, videoHint: { color: colors.muted, fontSize: 12 }, lessonContent: { padding: spacing.lg, gap: 12 }, kicker: { color: colors.yellow, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }, title: { color: colors.text, fontSize: 28, fontWeight: "900" }, copy: { color: colors.muted, lineHeight: 22, maxWidth: 820 }, actions: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }, primary: { minHeight: 48, justifyContent: "center", backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: spacing.lg }, primaryText: { color: colors.background, fontWeight: "900", fontSize: 11 }, secondary: { minHeight: 48, justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.lg }, secondaryText: { color: colors.text, fontWeight: "800", fontSize: 11 }, sidebar: { width: 360, backgroundColor: colors.surface, borderLeftWidth: 1, borderLeftColor: colors.border, padding: spacing.lg }, sidebarMobile: { width: "100%", maxHeight: 480, borderLeftWidth: 0, borderTopWidth: 1, borderTopColor: colors.border }, progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, progressTitle: { color: colors.text, fontSize: 19, fontWeight: "900" }, progressValue: { color: colors.yellow, fontSize: 12, marginTop: 5, fontWeight: "800" }, trophy: { color: colors.yellow, fontSize: 22 }, track: { height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden", marginVertical: spacing.md }, fill: { width: "68%", height: 7, backgroundColor: colors.yellow }, list: { flex: 1 }, lesson: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.md, marginBottom: 6 }, lessonActive: { backgroundColor: "rgba(245,197,24,0.11)" }, lessonState: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, lessonDone: { backgroundColor: colors.success, borderColor: colors.success }, lessonStateText: { color: colors.text, fontSize: 11, fontWeight: "900" }, lessonText: { flex: 1 }, lessonName: { color: colors.text, fontSize: 13, fontWeight: "700" }, lessonNameActive: { color: colors.yellow }, lessonMeta: { color: colors.muted, fontSize: 10, marginTop: 3 } });
