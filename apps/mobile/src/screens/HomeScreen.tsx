import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { BrandMark } from "../components/BrandMark";
import { CourseCard, type CourseCardData } from "../components/CourseCard";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

const courses: CourseCardData[] = [
  { title: "Degradê americano: do zero ao avançado", instructor: "Jean Thomas", rating: "4,9", price: "R$ 197", level: "Mais vendido", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80" },
  { title: "Barba premium e visagismo masculino", instructor: "Marcos Vieira", rating: "4,8", price: "R$ 149", level: "Intermediário", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80" },
  { title: "Colorimetria sem mistério", instructor: "André Luiz", rating: "4,7", price: "R$ 229", level: "Avançado", image: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=80" },
];

const categories = [
  ["✂", "Degradê"], ["♟", "Barba"], ["◐", "Coloração"], ["⌁", "Navalha"], ["▣", "Gestão"],
];

export function HomeScreen({ onOpenCourse }: { onOpenCourse?: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BrandMark />
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir notificações" style={styles.iconButton}><Text style={styles.iconText}>●</Text></Pressable>
          <View style={styles.avatar}><Text style={styles.avatarText}>JT</Text></View>
        </View>
      </View>

      <View style={[styles.hero, desktop && styles.heroDesktop]}>
        <ImageBackground source={{ uri: courses[0]?.image }} style={styles.heroImage} imageStyle={styles.heroImageRadius}>
          <View style={styles.heroOverlay}>
            <Text style={styles.eyebrow}>APRENDA COM QUEM FAZ</Text>
            <Text style={styles.heroTitle}>Evolua sua técnica.</Text>
            <Text style={styles.heroCopy}>Cursos feitos por barbeiros, para barbeiros. Conteúdo direto, profissional e sem enrolação.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Explorar cursos" style={styles.cta}><Text style={styles.ctaText}>EXPLORAR CURSOS  →</Text></Pressable>
          </View>
        </ImageBackground>
      </View>

      <View>
        <Text style={styles.sectionLabel}>O QUE VOCÊ QUER DOMINAR?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map(([icon, label]) => (
            <Pressable key={label} style={styles.category} accessibilityRole="button" accessibilityLabel={`Categoria ${label}`}>
              <Text style={styles.categoryIcon}>{icon}</Text><Text style={styles.categoryText}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Cursos em destaque</Text><Text style={styles.sectionSub}>Os favoritos da comunidade</Text></View><Text style={styles.seeAll}>Ver todos →</Text></View>
      {desktop ? (
        <View style={styles.courseGrid}>
          {courses.map((course) => <CourseCard key={course.title} course={course} wide onPress={onOpenCourse} />)}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseGridMobile}>
          {courses.map((course) => <CourseCard key={course.title} course={course} onPress={onOpenCourse} />)}
        </ScrollView>
      )}

      <View style={styles.continueCard}>
        <View style={styles.play}><Text style={styles.playText}>▶</Text></View>
        <View style={styles.continueBody}><Text style={styles.continueKicker}>CONTINUE DE ONDE PAROU</Text><Text style={styles.continueTitle}>Fundamentos do degradê</Text><View style={styles.progressTrack}><View style={styles.progressFill} /></View><Text style={styles.progressText}>68% concluído · Aula 8 de 12</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 1280, alignSelf: "center", padding: spacing.lg, paddingBottom: 110, gap: spacing.xl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  iconText: { color: colors.yellow, fontSize: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.background, fontWeight: "900" },
  hero: { minHeight: 360, borderRadius: radius.lg, overflow: "hidden" },
  heroDesktop: { minHeight: 430 },
  heroImage: { flex: 1, justifyContent: "flex-end" },
  heroImageRadius: { borderRadius: radius.lg },
  heroOverlay: { minHeight: 360, justifyContent: "flex-end", padding: spacing.xl, backgroundColor: "rgba(8,9,8,0.52)" },
  eyebrow: { color: colors.yellow, fontSize: 12, letterSpacing: 2, fontWeight: "900" },
  heroTitle: { color: colors.text, fontSize: 42, lineHeight: 46, fontWeight: "900", maxWidth: 560, marginTop: 8 },
  heroCopy: { color: "#E0E0DC", fontSize: 16, lineHeight: 24, maxWidth: 540, marginTop: 10 },
  cta: { minHeight: 52, alignSelf: "flex-start", justifyContent: "center", backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  ctaText: { color: colors.background, fontWeight: "900" },
  sectionLabel: { color: colors.muted, fontSize: 11, letterSpacing: 1.6, fontWeight: "800", marginBottom: spacing.md },
  categories: { gap: 12 },
  category: { minWidth: 108, minHeight: 84, alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  categoryIcon: { color: colors.yellow, fontSize: 23 },
  categoryText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  sectionTitle: { color: colors.text, fontSize: 27, fontWeight: "900" },
  sectionSub: { color: colors.muted, marginTop: 4 },
  seeAll: { color: colors.yellow, fontWeight: "800" },
  courseGrid: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  courseGridMobile: { flexDirection: "row", gap: spacing.md, paddingRight: spacing.lg },
  continueCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  play: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" },
  playText: { color: colors.background, fontSize: 22, marginLeft: 4 },
  continueBody: { flex: 1, gap: 7 },
  continueKicker: { color: colors.yellow, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  continueTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
  progressFill: { width: "68%", height: 6, backgroundColor: colors.yellow },
  progressText: { color: colors.muted, fontSize: 11 },
});
