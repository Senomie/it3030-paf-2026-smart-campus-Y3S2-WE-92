/** Backend origin (no trailing slash). OAuth lives here; REST is `${API_ORIGIN}/api`. */
export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080').replace(/\/$/, '');
