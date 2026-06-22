import { useRouter } from "expo-router";
import { HomeScreen } from "../../src/screens/HomeScreen";

export default function HomeRoute() {
  const router = useRouter();
  return <HomeScreen onOpenCourse={() => router.push("/course/course_1")} />;
}
