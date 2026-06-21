import { describe, expect, it } from "vitest";
import {
  assertCanSubmitCourse,
  courseInputSchema,
  transitionCourse,
} from "./course-policy.js";

describe("course policy", () => {
  const validCourse = {
    title: "Degradê americano do zero ao avançado",
    description: "Aprenda preparação, marcação, transições e acabamento profissional em um método completo.",
    categoryId: "cm12345678901234567890123",
    level: "BEGINNER" as const,
    priceCents: 19_700,
  };

  it("accepts the configured price range", () => {
    expect(courseInputSchema.parse({ ...validCourse, priceCents: 2_990 }).priceCents).toBe(2_990);
    expect(courseInputSchema.parse({ ...validCourse, priceCents: 99_900 }).priceCents).toBe(99_900);
  });

  it.each([2_989, 99_901, 10.5])("rejects invalid price %s", (priceCents) => {
    expect(() => courseInputSchema.parse({ ...validCourse, priceCents })).toThrow();
  });

  it("requires cover and at least one playable lesson before review", () => {
    expect(() =>
      assertCanSubmitCourse({ coverPath: null, modules: [{ lessons: [{ videoPath: "video.mp4" }] }] }),
    ).toThrow("COURSE_COVER_REQUIRED");
    expect(() =>
      assertCanSubmitCourse({ coverPath: "cover.jpg", modules: [{ lessons: [] }] }),
    ).toThrow("COURSE_LESSON_REQUIRED");
  });

  it("allows only explicit status transitions", () => {
    expect(transitionCourse("DRAFT", "SUBMIT")).toBe("IN_REVIEW");
    expect(transitionCourse("IN_REVIEW", "APPROVE")).toBe("PUBLISHED");
    expect(transitionCourse("IN_REVIEW", "REJECT", "Áudio com baixa qualidade.")).toBe("REJECTED");
    expect(() => transitionCourse("PUBLISHED", "SUBMIT")).toThrow("INVALID_COURSE_TRANSITION");
    expect(() => transitionCourse("IN_REVIEW", "REJECT", "")).toThrow("REJECTION_REASON_REQUIRED");
  });
});
