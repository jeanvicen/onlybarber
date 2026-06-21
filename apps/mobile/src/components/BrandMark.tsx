import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View accessibilityLabel="Only Barber" style={styles.row}>
      <Text style={styles.icon}>✂</Text>
      <View>
        {!compact ? <Text style={styles.only}>ONLY</Text> : null}
        <Text style={styles.barber}>BARBER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { color: colors.yellow, fontSize: 22 },
  only: { color: colors.muted, fontSize: 9, letterSpacing: 4, fontWeight: "800" },
  barber: { color: colors.yellow, fontSize: 22, lineHeight: 23, fontWeight: "900", letterSpacing: 1 },
});
