import { describe, expect, it } from "vitest";
import { updateProgress } from "./progress.js";

describe("lesson progress", () => {
  it("never moves watched progress backwards", () => {
    expect(updateProgress({ currentSeconds: 300, requestedSeconds: 120, durationSeconds: 600 })).toEqual({ positionSeconds: 300, completed: false });
  });

  it("caps progress and completes at 95 percent", () => {
    expect(updateProgress({ currentSeconds: 500, requestedSeconds: 900, durationSeconds: 600 })).toEqual({ positionSeconds: 600, completed: true });
    expect(updateProgress({ currentSeconds: 0, requestedSeconds: 570, durationSeconds: 600 }).completed).toBe(true);
  });

  it("rejects invalid positions", () => {
    expect(() => updateProgress({ currentSeconds: 0, requestedSeconds: -1, durationSeconds: 600 })).toThrow("INVALID_PROGRESS");
  });
});
