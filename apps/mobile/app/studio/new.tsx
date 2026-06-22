import { useRouter } from "expo-router";
import { CourseWizardScreen } from "../../src/screens/CourseWizardScreen";

export default function NewCourseRoute() {
  const router = useRouter();
  return <CourseWizardScreen onSubmit={() => router.replace("/studio")} />;
}
