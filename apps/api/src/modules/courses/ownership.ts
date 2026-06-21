export type OwnedCourseWhere = {
  id: string;
  instructorId: string;
};

export function ownedCourseWhere(
  courseId: string,
  instructorId: string,
): OwnedCourseWhere {
  if (!courseId.trim() || !instructorId.trim()) {
    throw new Error("INVALID_SCOPE");
  }

  return { id: courseId, instructorId };
}
