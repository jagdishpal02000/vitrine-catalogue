const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';
const OFFLINE_MESSAGE = 'We could not reach the server. Check your connection and try again.';

/** A failed API call, carrying a message that is safe to show to the user. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Every call to our API goes through here: one place for the base path and error handling. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, init);
  } catch {
    throw new ApiError(0, OFFLINE_MESSAGE);
  }

  if (!response.ok) throw new ApiError(response.status, await readErrorMessage(response));
  return (await response.json()) as T;
}

/** Our API answers errors with { error: { message } }. Anything else (e.g. a proxy page) gets a generic message. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? FALLBACK_MESSAGE;
  } catch {
    return FALLBACK_MESSAGE;
  }
}

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
