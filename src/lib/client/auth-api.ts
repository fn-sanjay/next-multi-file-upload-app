export async function fetchCsrfToken(): Promise<string> {
  const csrfRes = await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
  });

  const csrfJson = (await csrfRes.json().catch(() => null)) as {
    csrfToken?: string;
    error?: string;
  } | null;

  if (!csrfRes.ok || !csrfJson?.csrfToken) {
    throw new Error(csrfJson?.error ?? "Unable to get CSRF token");
  }

  return csrfJson.csrfToken;
}

export async function fetchWithRefresh(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let response = await fetch(input, init);

  if (response.status === 401) {
    // Try to refresh the token
    const refreshRes = await fetch("/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "x-csrf-token": await fetchCsrfToken().catch(() => ""),
      },
    });

    if (refreshRes.ok) {
      // Retry original request
      response = await fetch(input, init);
    }
  }

  return response;
}

export async function authPost<TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const csrfToken = await fetchCsrfToken();

  const response = await fetchWithRefresh(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | (TResponse & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }

  return (payload ?? {}) as TResponse;
}
