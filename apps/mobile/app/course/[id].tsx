import { useRouter } from "expo-router";
import { CourseDetailScreen } from "../../src/screens/CourseDetailScreen";

export default function CourseRoute() {
  const router = useRouter();
  const openLearning = () => router.push("/learn/course_1");
  return <CourseDetailScreen onBuy={openLearning} onPreview={openLearning} />;
}
