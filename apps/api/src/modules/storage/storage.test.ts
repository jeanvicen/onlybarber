import { describe, expect, it, vi } from "vitest";
import { createStorageService } from "./storage.js";

describe("private storage service", () => {
  it("creates a five-minute signed URL after authorization", async () => {
    const signer = { signDownload: vi.fn().mockResolvedValue("https://signed.example/file") };
    const service = createStorageService(signer);
    await expect(service.download({ actorId: "user_1", ownerId: "user_1", path: "user_1/video.mp4", enrolled: false })).resolves.toBe("https://signed.example/file");
    expect(signer.signDownload).toHaveBeenCalledWith("user_1/video.mp4", 300);
  });

  it("rejects users who neither own nor enrolled in the asset", async () => {
    const signer = { signDownload: vi.fn() };
    const service = createStorageService(signer);
    await expect(service.download({ actorId: "user_2", ownerId: "user_1", path: "user_1/video.mp4", enrolled: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(signer.signDownload).not.toHaveBeenCalled();
  });
});
