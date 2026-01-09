/**
 * Constantes de la aplicación
 */

export const APP_CONFIG = {
  name: "AutoCatalog",
  version: "1.0.0",
  description: "Catálogo de autos moderno y responsivo",
};

export const CONTACT_INFO = {
  email: "info@autocatalog.com",
  phone: "543465668393",
  whatsapp: "543465668393",
};

export const PAGINATION = {
  itemsPerPage: 10,
  defaultSort: "name",
};

export const SORT_OPTIONS = [
  { value: "name", label: "Nombre (A-Z)" },
  { value: "precio-asc", label: "Precio ($ ↑)" },
  { value: "precio-desc", label: "Precio ($ ↓)" },
  { value: "año", label: "Año (Más Nuevo)" },
];

export const FILTER_DEFAULTS = {
  brand: "todos",
  priceRange: [0, 100000],
  fuel: "todos",
  transmission: "todos",
  traction: "todos",
};

export const ERROR_MESSAGES = {
  loadVehicles: "No pudimos cargar el catálogo. Por favor, intenta más tarde.",
  loadDetail: "No pudimos cargar los detalles del auto.",
  invalidEmail: "Por favor ingresa un email válido.",
  requiredField: "Este campo es requerido.",
  sendMessage: "Hubo un error al enviar el mensaje. Intenta nuevamente.",
};

export const SUCCESS_MESSAGES = {
  messageSent: "¡Mensaje enviado correctamente!",
  vehicleCreated: "Vehículo creado exitosamente.",
  vehicleUpdated: "Vehículo actualizado exitosamente.",
  vehicleDeleted: "Vehículo eliminado exitosamente.",
};
