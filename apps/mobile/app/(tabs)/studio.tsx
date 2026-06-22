import { useRouter } from "expo-router";
import { StudioScreen } from "../../src/screens/StudioScreen";

export default function StudioRoute() {
  const router = useRouter();
  return <StudioScreen onCreateCourse={() => router.push("/studio/new")} />;
}
