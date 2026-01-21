const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: "Unknown error" };
    }

    throw error;
  }

  if (res.status === 204 || res.status === 201) return null;

  return res.json();
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, data) =>
    request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) =>
    request(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: (path, data) =>
    request(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
