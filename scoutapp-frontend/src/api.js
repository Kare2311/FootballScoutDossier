const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

function getToken() {
  return localStorage.getItem("scoutapp_token");
}

async function request(path, options = {}, auth = false) {
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || `Greška ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // auth
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me", {}, true),

  // players
  getPlayers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/players${query ? `?${query}` : ""}`);
  },
  getPlayer: (id) => request(`/players/${id}`),
  searchExternalPlayers: (query) =>
    request(`/players/search-external?q=${encodeURIComponent(query)}`),
  createPlayer: (payload) =>
    request("/players", { method: "POST", body: JSON.stringify(payload) }, true),
  updatePlayer: (id, payload) =>
    request(`/players/${id}`, { method: "PUT", body: JSON.stringify(payload) }, true),
  deletePlayer: (id) => request(`/players/${id}`, { method: "DELETE" }, true),

  // reports
  getReports: (playerId) => request(`/players/${playerId}/reports`),
  getMyReports: () => request("/reports/mine", {}, true),
  createReport: (playerId, payload) =>
    request(
      `/players/${playerId}/reports`,
      { method: "POST", body: JSON.stringify(payload) },
      true
    ),

  // watchlist
  getWatchlist: () => request("/watchlist", {}, true),
  addToWatchlist: (playerId, status = "monitoring") =>
    request("/watchlist", { method: "POST", body: JSON.stringify({ playerId, status }) }, true),
  updateWatchlistStatus: (entryId, status) =>
    request(`/watchlist/${entryId}`, { method: "PUT", body: JSON.stringify({ status }) }, true),
  removeFromWatchlist: (entryId) =>
    request(`/watchlist/${entryId}`, { method: "DELETE" }, true),
};
