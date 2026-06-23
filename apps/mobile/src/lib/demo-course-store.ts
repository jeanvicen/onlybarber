import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "onlybarber.demo.courses";

export type DemoCourseDraft = {
  title: string;
  description: string;
  price: string;
};

export type DemoCourse = DemoCourseDraft & {
  id: string;
  status: "EM REVISÃO";
  detail: string;
  revenue: string;
  createdAt: string;
};

export type StorageLike = Pick<typeof AsyncStorage, "getItem" | "setItem" | "removeItem">;

export async function listDemoCourses(storage: StorageLike = AsyncStorage): Promise<DemoCourse[]> {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDemoCourse);
  } catch {
    return [];
  }
}

export async function saveDemoCourse(
  draft: DemoCourseDraft,
  storage: StorageLike = AsyncStorage,
): Promise<DemoCourse> {
  const course: DemoCourse = {
    ...draft,
    id: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "EM REVISÃO",
    detail: "1 módulo · 3 aulas",
    revenue: "—",
    createdAt: new Date().toISOString(),
  };
  const current = await listDemoCourses(storage);
  await storage.setItem(STORAGE_KEY, JSON.stringify([course, ...current]));
  return course;
}

export async function clearDemoCourses(storage: StorageLike = AsyncStorage): Promise<void> {
  await storage.removeItem(STORAGE_KEY);
}

function isDemoCourse(value: unknown): value is DemoCourse {
  if (!value || typeof value !== "object") return false;
  const course = value as Partial<DemoCourse>;
  return typeof course.id === "string"
    && typeof course.title === "string"
    && typeof course.description === "string"
    && typeof course.price === "string"
    && course.status === "EM REVISÃO"
    && typeof course.createdAt === "string";
}
