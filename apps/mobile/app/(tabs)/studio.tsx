import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { listDemoCourses } from "../../src/lib/demo-course-store";
import { StudioScreen } from "../../src/screens/StudioScreen";
import type { StudioCourse } from "../../src/screens/StudioScreen";

export default function StudioRoute() {
  const router = useRouter();
  const [createdCourses, setCreatedCourses] = useState<StudioCourse[]>([]);

  useFocusEffect(useCallback(() => {
    let active = true;
    void listDemoCourses().then((saved) => {
      if (!active) return;
      setCreatedCourses(saved.map((course) => ({
        id: course.id,
        name: course.title,
        status: course.status,
        detail: course.detail,
        revenue: course.revenue,
      })));
    });
    return () => { active = false; };
  }, []));

  return <StudioScreen additionalCourses={createdCourses} onCreateCourse={() => router.push("/studio/new")} />;
}
