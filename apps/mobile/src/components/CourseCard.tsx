import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

export type CourseCardData = {
  title: string;
  instructor: string;
  rating: string;
  price: string;
  image: string;
  level: string;
};

export function CourseCard({ course, wide = false, onPress }: { course: CourseCardData; wide?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir curso ${course.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, wide && styles.wide, pressed && styles.pressed]}
    >
      <ImageBackground source={{ uri: course.image }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.level}><Text style={styles.levelText}>{course.level}</Text></View>
        <View style={styles.rating}><Text style={styles.ratingText}>★ {course.rating}</Text></View>
      </ImageBackground>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.instructor}>{course.instructor}</Text>
        <View style={styles.footer}>
          <Text style={styles.meta}>12 aulas · 4h 20min</Text>
          <Text style={styles.price}>{course.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 260, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  wide: { width: "100%", maxWidth: 360 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  image: { height: 154, padding: spacing.sm, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  imageRadius: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  level: { backgroundColor: "rgba(16,17,16,0.86)", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  levelText: { color: colors.text, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  rating: { marginTop: 116, backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5 },
  ratingText: { color: colors.background, fontSize: 11, fontWeight: "900" },
  body: { padding: spacing.md, gap: 7 },
  title: { color: colors.text, fontSize: 17, lineHeight: 21, fontWeight: "900" },
  instructor: { color: colors.muted, fontSize: 13 },
  footer: { marginTop: spacing.sm, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { color: colors.muted, fontSize: 11 },
  price: { color: colors.yellow, fontWeight: "900", fontSize: 15 },
});
