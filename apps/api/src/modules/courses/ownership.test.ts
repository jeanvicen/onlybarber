import { describe, expect, it } from "vitest";
import { ownedCourseWhere } from "./ownership.js";

describe("ownedCourseWhere", () => {
  it("always scopes a course query to the authenticated instructor", () => {
    expect(ownedCourseWhere("course_1", "instructor_1")).toEqual({
      id: "course_1",
      instructorId: "instructor_1",
    });
  });

  it("rejects empty identifiers", () => {
    expect(() => ownedCourseWhere("", "instructor_1")).toThrow("INVALID_SCOPE");
    expect(() => ownedCourseWhere("course_1", "")).toThrow("INVALID_SCOPE");
  });
});
