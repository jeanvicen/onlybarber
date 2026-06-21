import { describe, expect, it } from "vitest";
import { splitRevenue } from "./money.js";

describe("splitRevenue", () => {
  it("splits a normal sale without losing cents", () => {
    expect(splitRevenue(19_700, false)).toEqual({
      instructor: 13_790,
      platform: 4_925,
      processor: 985,
      affiliate: 0,
    });
  });

  it("splits an affiliate sale without losing cents", () => {
    expect(splitRevenue(19_700, true)).toEqual({
      instructor: 11_820,
      platform: 4_925,
      processor: 985,
      affiliate: 1_970,
    });
  });

  it("assigns rounding remainder to the instructor", () => {
    const split = splitRevenue(2_991, false);
    expect(Object.values(split).reduce((sum, value) => sum + value, 0)).toBe(2_991);
  });

  it.each([12.5, -1, Number.NaN])("rejects invalid amount %s", (amount) => {
    expect(() => splitRevenue(amount, false)).toThrow("INVALID_AMOUNT");
  });
});
