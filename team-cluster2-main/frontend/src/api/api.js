const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://dtfj.helioho.st/backendHRIS/backend").replace(/\/$/, "");

/**
 * Build endpoint URL with cache-busting for GET requests
 */
function buildEndpointUrl(endpoint, method) {
  const upperMethod = (method ?? "GET").toUpperCase();
  if (upperMethod !== "GET") return `${BASE_URL}/${endpoint}`;

  const separator = endpoint.includes("?") ? "&" : "?";
  return `${BASE_URL}/${endpoint}${separator}_ts=${Date.now()}`;
}

/**
 * API fetch wrapper that includes credentials for PHP session
 */
export async function apiFetch(endpoint, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();

  const res = await fetch(buildEndpointUrl(endpoint, method), {
    credentials: "include", // important for sending PHP session cookies
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers || {}), // merge in caller headers
    },
    ...options,
  });

  // try parsing JSON safely
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    throw data ?? { error: `HTTP ${res.status}` };
  }

  return data;
}