import { useRouter } from "expo-router";
import { saveDemoCourse } from "../../src/lib/demo-course-store";
import { CourseWizardScreen } from "../../src/screens/CourseWizardScreen";

export default function NewCourseRoute() {
  const router = useRouter();
  return <CourseWizardScreen onSubmit={async (draft) => {
    await saveDemoCourse(draft);
    router.replace("/studio");
  }} />;
}
