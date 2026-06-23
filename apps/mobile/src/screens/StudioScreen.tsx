import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { BrandMark } from "../components/BrandMark";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

const metrics = [["Receita no mês", "R$ 12.480", "+18%"], ["Alunos ativos", "1.284", "+96"], ["Avaliação média", "4,9", "★"], ["Conclusão", "76%", "+4%"]];
export type StudioCourse = { id: string; name: string; status: string; detail: string; revenue: string };

const courses: StudioCourse[] = [
  { id: "course_1", name: "Degradê americano completo", status: "PUBLICADO", detail: "642 alunos", revenue: "R$ 8.930" },
  { id: "course_2", name: "Barba premium e visagismo", status: "EM REVISÃO", detail: "—", revenue: "—" },
  { id: "course_3", name: "Gestão de barbearia", status: "RASCUNHO", detail: "3 de 8 aulas", revenue: "—" },
];

export function StudioScreen({ onCreateCourse, additionalCourses = [] }: { onCreateCourse?: () => void; additionalCourses?: StudioCourse[] }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.top}><BrandMark compact /><View style={styles.instructor}><View style={styles.dot} /><Text style={styles.instructorText}>Perfil verificado</Text></View></View>
      <View style={[styles.heading, !desktop && styles.headingMobile]}>
        <View><Text style={styles.eyebrow}>PAINEL PROFISSIONAL</Text><Text style={styles.title}>Studio do instrutor</Text><Text style={styles.subtitle}>Acompanhe seu negócio e publique conhecimento.</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Criar novo curso" onPress={onCreateCourse} style={styles.createButton}><Text style={styles.createText}>＋  CRIAR NOVO CURSO</Text></Pressable>
      </View>
      <View style={styles.metrics}>
        {metrics.map(([label, value, change]) => <View key={label} style={[styles.metric, desktop && styles.metricDesktop]}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricChange}>{change} este mês</Text></View>)}
      </View>
      <View style={styles.panel}>
        <View style={styles.panelHeader}><View><Text style={styles.panelTitle}>Seus cursos</Text><Text style={styles.panelSubtitle}>Conteúdo, desempenho e publicação</Text></View><Text style={styles.link}>Ver catálogo →</Text></View>
        {[...additionalCourses, ...courses].map(({ id, name, status, detail, revenue }, index, allCourses) => (
          <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Gerenciar curso ${name}`} style={[styles.courseRow, index === allCourses.length - 1 && styles.courseRowLast]}>
            <View style={styles.courseNumber}><Text style={styles.courseNumberText}>0{index + 1}</Text></View>
            <View style={styles.courseMain}><Text style={styles.courseName}>{name}</Text><Text style={styles.courseDetail}>{detail}</Text></View>
            <View style={styles.courseSide}><Text style={[styles.status, status === "PUBLICADO" && styles.statusLive]}>{status}</Text><Text style={styles.revenue}>{revenue}</Text></View>
          </Pressable>
        ))}
      </View>
      <View style={[styles.bottomGrid, !desktop && styles.bottomMobile]}>
        <View style={styles.insight}><Text style={styles.insightKicker}>INSIGHT DA SEMANA</Text><Text style={styles.insightTitle}>Alunos que concluem o módulo 2 têm 3× mais chance de finalizar o curso.</Text><Text style={styles.insightCopy}>Considere adicionar uma atividade prática após a aula 6.</Text></View>
        <View style={styles.balance}><Text style={styles.metricLabel}>Saldo disponível</Text><Text style={styles.balanceValue}>R$ 9.340,50</Text><Text style={styles.balanceCopy}>Próximo repasse em até 2 dias úteis</Text><Pressable accessibilityRole="button" accessibilityLabel="Solicitar saque" style={styles.withdraw}><Text style={styles.withdrawText}>SOLICITAR SAQUE</Text></Pressable></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { width: "100%", maxWidth: 1280, alignSelf: "center", padding: spacing.lg, paddingBottom: 110, gap: spacing.xl },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, instructor: { flexDirection: "row", alignItems: "center", gap: 8 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }, instructorText: { color: colors.muted, fontSize: 12 },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: spacing.lg }, headingMobile: { alignItems: "flex-start", flexDirection: "column" }, eyebrow: { color: colors.yellow, fontSize: 11, fontWeight: "900", letterSpacing: 1.8 }, title: { color: colors.text, fontSize: 38, lineHeight: 44, fontWeight: "900", marginTop: 6 }, subtitle: { color: colors.muted, fontSize: 15, marginTop: 6 },
  createButton: { minHeight: 52, justifyContent: "center", backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: spacing.lg }, createText: { color: colors.background, fontWeight: "900" },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md }, metric: { width: "47%", minWidth: 150, flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 8 }, metricDesktop: { width: "22%" }, metricLabel: { color: colors.muted, fontSize: 12 }, metricValue: { color: colors.text, fontSize: 29, fontWeight: "900" }, metricChange: { color: colors.success, fontSize: 11, fontWeight: "700" },
  panel: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }, panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, panelTitle: { color: colors.text, fontSize: 23, fontWeight: "900" }, panelSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 }, link: { color: colors.yellow, fontWeight: "800", fontSize: 12 },
  courseRow: { minHeight: 92, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.md }, courseRowLast: { borderBottomWidth: 0 }, courseNumber: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceElevated, alignItems: "center", justifyContent: "center" }, courseNumberText: { color: colors.yellow, fontWeight: "900" }, courseMain: { flex: 1 }, courseName: { color: colors.text, fontSize: 15, fontWeight: "800" }, courseDetail: { color: colors.muted, fontSize: 12, marginTop: 6 }, courseSide: { alignItems: "flex-end", gap: 8 }, status: { color: colors.yellow, backgroundColor: "rgba(245,197,24,0.12)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, fontSize: 9, fontWeight: "900" }, statusLive: { color: colors.success, backgroundColor: "rgba(77,214,140,0.1)" }, revenue: { color: colors.text, fontSize: 12, fontWeight: "800" },
  bottomGrid: { flexDirection: "row", gap: spacing.md }, bottomMobile: { flexDirection: "column" }, insight: { flex: 1.3, backgroundColor: colors.yellow, borderRadius: radius.lg, padding: spacing.lg, gap: 10 }, insightKicker: { color: colors.background, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }, insightTitle: { color: colors.background, fontSize: 21, lineHeight: 27, fontWeight: "900" }, insightCopy: { color: "#3B3100", fontSize: 13, lineHeight: 19 }, balance: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 9 }, balanceValue: { color: colors.text, fontSize: 28, fontWeight: "900" }, balanceCopy: { color: colors.muted, fontSize: 12 }, withdraw: { minHeight: 46, marginTop: 8, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.yellow, borderRadius: radius.pill }, withdrawText: { color: colors.yellow, fontWeight: "900", fontSize: 12 },
});
