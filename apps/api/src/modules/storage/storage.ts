import { ApiError } from "../../http/errors.js";

type StorageSigner = {
  signDownload(path: string, expiresInSeconds: number): Promise<string>;
};

type DownloadRequest = {
  actorId: string;
  ownerId: string;
  path: string;
  enrolled: boolean;
};

export function createStorageService(signer: StorageSigner) {
  return {
    async download(request: DownloadRequest): Promise<string> {
      if (request.actorId !== request.ownerId && !request.enrolled) {
        throw new ApiError(403, "FORBIDDEN", "Você não tem acesso a este arquivo.");
      }
      if (!request.path.startsWith(`${request.ownerId}/`)) {
        throw new ApiError(403, "FORBIDDEN", "Caminho de arquivo inválido.");
      }
      return signer.signDownload(request.path, 300);
    },
  };
}
