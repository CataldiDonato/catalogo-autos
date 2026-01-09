import API_ENDPOINTS from "../config";
import { getToken } from "./formatters";

/**
 * Realiza petición con headers de autenticación
 */
export const apiCall = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
};

/**
 * Obtiene lista de vehículos
 */
export const fetchVehicles = () => apiCall(API_ENDPOINTS.VEHICLES);

/**
 * Obtiene detalles de vehículo
 */
export const fetchVehicleDetail = (id) =>
  apiCall(API_ENDPOINTS.VEHICLE_DETAIL(id));

/**
 * Crea nuevo vehículo
 */
export const createVehicle = (data) =>
  apiCall(API_ENDPOINTS.VEHICLES, {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Actualiza vehículo
 */
export const updateVehicle = (id, data) =>
  apiCall(`${API_ENDPOINTS.VEHICLES}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

/**
 * Elimina vehículo
 */
export const deleteVehicle = (id) =>
  apiCall(`${API_ENDPOINTS.VEHICLES}/${id}`, {
    method: "DELETE",
  });
