import { ApiError } from './errors';

// The version of the API this app is built against. Moving to v2 is a deliberate change here.
const API_BASE_PATH = '/api/v1';

/**
 * Every call to our API goes through here: one place for the base path and error handling.
 * Any failure becomes an ApiError, whose message is always friendly text from errors.ts.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_PATH}${path}`, init);
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR');
  }

  if (!response.ok) throw new ApiError(response.status, await readErrorCode(response));

  try {
    return (await response.json()) as T;
  } catch {
    // A success status without valid JSON means something other than our API answered (e.g. a proxy page).
    throw new ApiError(response.status, 'INVALID_RESPONSE');
  }
}

/** Our API answers errors with { error: { code } }. We read only the code, never the API's wording. */
async function readErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { code?: string } };
    return body.error?.code ?? 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
