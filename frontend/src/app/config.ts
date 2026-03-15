/**
 * App config. Base URL for backend API.
 * Set VITE_API_BASE_URL in .env (e.g. http://localhost:8000) or leave empty for same-origin.
 */
const base = import.meta.env.VITE_API_BASE_URL ?? '';
export const API_BASE_URL = base ? `${base.replace(/\/$/, '')}/api/v1` : '/api/v1';
