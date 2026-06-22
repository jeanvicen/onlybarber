import { useRouter } from "expo-router";
import { LoginScreen } from "../src/screens/LoginScreen";

export default function LoginRoute() {
  const router = useRouter();
  const enterApp = () => router.replace("/home");
  return <LoginScreen onLogin={enterApp} onDemo={enterApp} />;
}
