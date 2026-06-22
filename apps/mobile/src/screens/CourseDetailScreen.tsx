import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

export function CourseDetailScreen({ onBuy, onPreview }: { onBuy: () => void; onPreview: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.hero, desktop && styles.heroDesktop]}>
        <ImageBackground source={{ uri: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1400&q=85" }} style={styles.cover} imageStyle={styles.coverRadius}>
          <Pressable accessibilityRole="button" accessibilityLabel="Assistir prévia gratuita" onPress={onPreview} style={styles.play}><Text style={styles.playText}>▶</Text></Pressable>
        </ImageBackground>
        <View style={styles.summary}>
          <Text style={styles.kicker}>MAIS VENDIDO · INICIANTE AO AVANÇADO</Text>
          <Text style={styles.title}>Degradê americano: do zero ao avançado</Text>
          <Text style={styles.copy}>Domine marcação, transições, acabamento e atendimento com um método direto, gravado dentro da barbearia.</Text>
          <View style={styles.author}><View style={styles.avatar}><Text style={styles.avatarText}>JT</Text></View><View><Text style={styles.authorName}>Jean Thomas</Text><Text style={styles.authorMeta}>Instrutor verificado · ★ 4,9 (386 avaliações)</Text></View></View>
          <View style={styles.buyRow}><Text style={styles.price}>R$ 197</Text><Text style={styles.installments}>ou 12× de R$ 19,70</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Comprar curso por R$ 197" onPress={onBuy} style={styles.buy}><Text style={styles.buyText}>COMPRAR AGORA</Text></Pressable>
          <Text style={styles.safe}>🔒 Pagamento seguro pelo Stripe · acesso vitalício</Text>
        </View>
      </View>
      <View style={[styles.columns, !desktop && styles.columnsMobile]}>
        <View style={styles.main}>
          <Text style={styles.sectionTitle}>O que você vai dominar</Text>
          {["Preparação e leitura do formato da cabeça", "Marcações limpas sem criar novas linhas", "Transição com máquina, pente e tesoura", "Acabamento, fotografia e fidelização"].map((item) => <View key={item} style={styles.benefit}><Text style={styles.check}>✓</Text><Text style={styles.benefitText}>{item}</Text></View>)}
        </View>
        <View style={styles.modules}><Text style={styles.sectionTitle}>Conteúdo do curso</Text>{[["01", "Fundamentos", "3 aulas · 42min"], ["02", "Construindo o degradê", "6 aulas · 2h 10min"], ["03", "Acabamento premium", "3 aulas · 1h 28min"]].map(([num, name, meta]) => <View key={num} style={styles.module}><Text style={styles.moduleNum}>{num}</Text><View style={styles.moduleBody}><Text style={styles.moduleName}>{name}</Text><Text style={styles.moduleMeta}>{meta}</Text></View><Text style={styles.lock}>▣</Text></View>)}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { maxWidth: 1280, width: "100%", alignSelf: "center", padding: spacing.lg, paddingBottom: 80, gap: spacing.xl }, hero: { gap: spacing.lg }, heroDesktop: { flexDirection: "row" }, cover: { minHeight: 360, flex: 1.3, alignItems: "center", justifyContent: "center" }, coverRadius: { borderRadius: radius.lg }, play: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" }, playText: { color: colors.background, fontSize: 28, marginLeft: 5 }, summary: { flex: 1, justifyContent: "center", gap: 14, padding: spacing.md }, kicker: { color: colors.yellow, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 35, lineHeight: 40, fontWeight: "900" }, copy: { color: colors.muted, fontSize: 15, lineHeight: 22 }, author: { flexDirection: "row", alignItems: "center", gap: 12 }, avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" }, avatarText: { color: colors.background, fontWeight: "900" }, authorName: { color: colors.text, fontWeight: "900" }, authorMeta: { color: colors.muted, fontSize: 11, marginTop: 4 }, buyRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 }, price: { color: colors.text, fontSize: 32, fontWeight: "900" }, installments: { color: colors.muted, paddingBottom: 5 }, buy: { minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" }, buyText: { color: colors.background, fontWeight: "900" }, safe: { color: colors.muted, fontSize: 11, textAlign: "center" }, columns: { flexDirection: "row", gap: spacing.lg }, columnsMobile: { flexDirection: "column" }, main: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 14 }, modules: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 10 }, sectionTitle: { color: colors.text, fontSize: 23, fontWeight: "900", marginBottom: 7 }, benefit: { flexDirection: "row", gap: 12, alignItems: "center" }, check: { color: colors.yellow, fontSize: 18, fontWeight: "900" }, benefitText: { color: colors.text, flex: 1 }, module: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: radius.md }, moduleNum: { color: colors.yellow, fontWeight: "900" }, moduleBody: { flex: 1 }, moduleName: { color: colors.text, fontWeight: "800" }, moduleMeta: { color: colors.muted, fontSize: 11, marginTop: 4 }, lock: { color: colors.yellow } });
