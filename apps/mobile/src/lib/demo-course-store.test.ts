import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

import {
  clearDemoCourses,
  listDemoCourses,
  saveDemoCourse,
  type StorageLike,
} from "./demo-course-store";

function memoryStorage(): StorageLike {
  const values = new Map<string, string>();
  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => void values.set(key, value),
    removeItem: async (key) => void values.delete(key),
  };
}

describe("demo course store", () => {
  let storage: StorageLike;

  beforeEach(() => {
    storage = memoryStorage();
    return clearDemoCourses(storage);
  });

  it("persists a submitted course as under review", async () => {
    const saved = await saveDemoCourse(
      {
        title: "Degradê completo",
        description: "Técnica profissional de degradê do início ao acabamento.",
        price: "197,00",
      },
      storage,
    );

    expect(saved.status).toBe("EM REVISÃO");
    await expect(listDemoCourses(storage)).resolves.toEqual([saved]);
  });

  it("survives malformed browser data without breaking the Studio", async () => {
    await storage.setItem("onlybarber.demo.courses", "not-json");
    await expect(listDemoCourses(storage)).resolves.toEqual([]);
  });
});
