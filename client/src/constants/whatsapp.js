/**
 * Configuración de WhatsApp
 */
export const WHATSAPP_CONFIG = {
  phone: "543465668393",
  defaultMessage: "Holaa, quiero hacer una consulta",
  consultaUrl:
    "https://api.whatsapp.com/send/?phone=543465668393&text=Holaa+Quiero+hacer+una+consulta&type=phone_number&app_absent=0",
  pruebaUrl:
    "https://api.whatsapp.com/send/?phone=543465668393&text=Me+gustaria+solicitar+una+prueba+de+manejo&type=phone_number&app_absent=0",
};

/**
 * Construye URL de WhatsApp
 */
export const getWhatsAppUrl = (message = WHATSAPP_CONFIG.defaultMessage) => {
  return `https://api.whatsapp.com/send/?phone=${
    WHATSAPP_CONFIG.phone
  }&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
};
