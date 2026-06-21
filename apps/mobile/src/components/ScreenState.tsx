import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

type Props = {
  state: "loading" | "empty" | "error";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ScreenState({ state, title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {state === "loading" ? <ActivityIndicator size="large" color={colors.yellow} /> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center" },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  button: {
    minHeight: 48,
    justifyContent: "center",
    backgroundColor: colors.yellow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: colors.background, fontWeight: "900", fontSize: 15 },
});
