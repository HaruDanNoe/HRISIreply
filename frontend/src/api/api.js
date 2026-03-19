const BASE_URL = "/api-proxy";
function buildEndpointUrl(endpoint, method) {
  if ((method ?? "GET").toUpperCase() !== "GET") {
    return `${BASE_URL}/${endpoint}`;
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  return `${BASE_URL}/${endpoint}${separator}_ts=${Date.now()}`;
}

export async function apiFetch(endpoint, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const res = await fetch(buildEndpointUrl(endpoint, method), {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await res.json();
  if (!res.ok) {
    // Extract a string message from the error object if it exists
    const errorMsg = data.error || data.message || JSON.stringify(data);
    throw { ...data, error: errorMsg };
  }
  return data;
}