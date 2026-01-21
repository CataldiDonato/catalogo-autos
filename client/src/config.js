// ============================================================
// CONFIGURACIÓN DE RUTAS DE API
// ============================================================
// Esta configuración se adapta automáticamente al entorno
// (desarrollo local o servidor en producción)

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? `${window.location.origin.replace(/:\d+/, ":3000")}`
    : "");

export const API_ENDPOINTS = {
  // Autenticación
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,

  // Publicaciones (Antes Vehículos)
  PUBLICATIONS: `${API_BASE_URL}/api/publications`,
  PUBLICATION_DETAIL: (id) => `${API_BASE_URL}/api/publications/${id}`,

  // Uploads
  UPLOAD: `${API_BASE_URL}/api/upload`,

  // Contacto
  CONTACT: `${API_BASE_URL}/api/contact`,

  // Bot Parser
  BOT_PARSE: `${API_BASE_URL}/api/bot/parse`
};

export default API_ENDPOINTS;
