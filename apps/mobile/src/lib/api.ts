type ApiClientOptions = {
  baseUrl: string;
  fetcher: typeof fetch;
  getToken: () => Promise<string>;
  createKey: () => string;
};

type ApiErrorBody = {
  error_code?: string;
  message?: string;
  request_id?: string;
};

export class ClientApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

export function createApiClient(options: ApiClientOptions) {
  async function execute(path: string, init: RequestInit): Promise<unknown> {
    const response = await options.fetcher(`${options.baseUrl}${path}`, init);
    const body = (await response.json()) as ApiErrorBody;
    if (!response.ok) {
      throw new ClientApiError(
        body.error_code ?? "INTERNAL_ERROR",
        body.message ?? "Não foi possível concluir a ação. Tente novamente.",
        body.request_id,
      );
    }
    return body;
  }

  return {
    async query<T>(path: string): Promise<T> {
      const token = await options.getToken();
      return (await execute(path, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })) as T;
    },

    async mutate<T>(path: string, body: unknown, retries = 0): Promise<T> {
      const token = await options.getToken();
      const idempotencyKey = options.createKey();
      const init: RequestInit = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(body),
      };

      let attempt = 0;
      while (true) {
        try {
          return (await execute(path, init)) as T;
        } catch (error) {
          if (error instanceof ClientApiError || attempt >= retries) throw error;
          attempt += 1;
        }
      }
    },
  };
}
