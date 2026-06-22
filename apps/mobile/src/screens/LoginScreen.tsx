import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BrandMark } from "../components/BrandMark";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

type Props = { onLogin: (email: string, password: string) => void; onDemo: () => void };

export function LoginScreen({ onLogin, onDemo }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Informe um e-mail válido."); return; }
    if (password.length < 8) { setError("A senha precisa ter pelo menos 8 caracteres."); return; }
    setError(undefined);
    onLogin(email.trim(), password);
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <BrandMark />
        <View><Text style={styles.title}>Bem-vindo de volta.</Text><Text style={styles.subtitle}>Entre para continuar sua evolução.</Text></View>
        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput accessibilityLabel="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seuemail@exemplo.com" placeholderTextColor={colors.muted} style={styles.input} />
          <Text style={styles.label}>Senha</Text>
          <TextInput accessibilityLabel="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={colors.muted} style={styles.input} />
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Entrar" onPress={submit} style={styles.primary}><Text style={styles.primaryText}>ENTRAR</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Entrar em modo demonstração" onPress={onDemo} style={styles.demo}><Text style={styles.demoText}>EXPLORAR DEMONSTRAÇÃO</Text></Pressable>
        </View>
        <Text style={styles.security}>🔒 Senha e cartão nunca passam pela API Only Barber.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 720, backgroundColor: colors.background, justifyContent: "center", padding: spacing.lg }, card: { width: "100%", maxWidth: 480, alignSelf: "center", gap: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl }, title: { color: colors.text, fontSize: 31, fontWeight: "900" }, subtitle: { color: colors.muted, marginTop: 7 }, form: { gap: 10 }, label: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 4 }, input: { minHeight: 52, color: colors.text, backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 15 }, error: { color: colors.danger, fontSize: 13 }, primary: { minHeight: 54, alignItems: "center", justifyContent: "center", backgroundColor: colors.yellow, borderRadius: radius.pill, marginTop: 8 }, primaryText: { color: colors.background, fontWeight: "900" }, demo: { minHeight: 50, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.yellow, borderRadius: radius.pill }, demoText: { color: colors.yellow, fontWeight: "900", fontSize: 12 }, security: { color: colors.muted, fontSize: 11, textAlign: "center" },
});
