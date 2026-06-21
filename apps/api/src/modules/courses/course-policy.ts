import { z } from "zod";

export const courseInputSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(40).max(5_000),
  categoryId: z.string().regex(/^c[a-z0-9]{20,}$/),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  priceCents: z.number().int().min(2_990).max(99_900),
});

type SubmissionCourse = {
  coverPath: string | null;
  modules: Array<{ lessons: Array<{ videoPath: string | null }> }>;
};

export function assertCanSubmitCourse(course: SubmissionCourse): void {
  if (!course.coverPath) throw new Error("COURSE_COVER_REQUIRED");
  const playableLessons = course.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.videoPath);
  if (playableLessons.length === 0) throw new Error("COURSE_LESSON_REQUIRED");
}

type CourseStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
type CourseAction = "SUBMIT" | "APPROVE" | "REJECT" | "EDIT" | "ARCHIVE";

export function transitionCourse(
  current: CourseStatus,
  action: CourseAction,
  reason?: string,
): CourseStatus {
  if (action === "REJECT" && !reason?.trim()) throw new Error("REJECTION_REASON_REQUIRED");
  const transitions: Partial<Record<CourseStatus, Partial<Record<CourseAction, CourseStatus>>>> = {
    DRAFT: { SUBMIT: "IN_REVIEW" },
    IN_REVIEW: { APPROVE: "PUBLISHED", REJECT: "REJECTED" },
    REJECTED: { EDIT: "DRAFT" },
    PUBLISHED: { ARCHIVE: "ARCHIVED" },
  };
  const next = transitions[current]?.[action];
  if (!next) throw new Error("INVALID_COURSE_TRANSITION");
  return next;
}
