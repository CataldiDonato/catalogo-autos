# Documentación de API para Automatización (n8n / IA)

Este documento detalla cómo estructurar las llamadas a la API para cargar productos automáticamente. Está diseñado para ser consumido por un Agente de IA o configurado en herramientas como n8n.

## 1. Configuración General

*   **Endpoint**: `POST /api/webhook/n8n`
*   **URL Base**: `http://tu-servidor:5000` (o dominio de producción)
*   **Método**: `POST`
*   **Content-Type**: `multipart/form-data` (Requerido para soportar subida de imágenes)
*   **Autenticación**:
    *   **Header**: `x-api-key`
    *   **Valor**: (Clave configurada en `.env`, por defecto `cataldi_secret_123`)

---

## 2. Campos del Formulario (Body Parameters)

Todos estos campos deben enviarse dentro del cuerpo `form-data`.

| Campo | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `text` | String | Opcional* | Texto crudo (mensaje de WhatsApp/descripción). Si se envían los campos explícitos (`title`, `price`, etc.), este campo se usa de respaldo o ignorado. |
| `category` | String | **SÍ** | Categoría estricta: `VEHICULO`, `MAQUINARIA`, `HERRAMIENTA`. |
| `title` | String | **SÍ** | Título principal de la publicación. |
| `price` | Number | **SÍ** | Precio numérico (ej: `45000`). |
| `currency` | String | No | Moneda. Default: `USD`. Opciones: `USD`, `ARS`. |
| `description` | String | **SÍ** | Descripción detallada y formateada del producto. |
| `specs` | JSON | **SÍ** | Objeto JSON **convertido a String** con las características técnicas específicas. (Ver Estructuras JSON abajo). |
| `images` | File[] | No | Archivos de imagen (binarios). Se pueden enviar múltiples archivos bajo la misma clave `images`. |

> (*) Si no se envían campos explícitos (`title`, `price`), el sistema intentará parsear el campo `text`. Para control total por IA, **enviar siempre los campos explícitos**.

---

## 3. Estructuras JSON para `specs` (Por Categoría)

Dependiendo del valor de `category`, el campo `specs` debe tener las siguientes claves.

### A. Categoría: `VEHICULO`
Uso: Autos, Camionetas, Camiones, Utilitarios.

```json
{
  "brand": "Toyota",          // String: Marca
  "model": "Hilux SRX",       // String: Modelo
  "year": 2022,               // Number: Año
  "km": 45000,                // Number: Kilometraje
  "combustible": "Diesel",    // String: Nafta, Diesel, GNC, Híbrido
  "transmision": "Automática",// String: Manual, Automática
  "traccion": "4x4",          // String: 4x2, 4x4, AWD
  "condicion": "Usado",       // String: Nuevo, Usado
  "color": "Blanco"           // String: Color (Opcional)
}
```

### B. Categoría: `MAQUINARIA`
Uso: Tractores, Cosechadoras, Pulverizadoras, Sembradoras autopropulsadas.

```json
{
  "brand": "John Deere",      // String: Marca
  "model": "6155J",           // String: Modelo
  "year": 2021,               // Number: Año
  "horas": 1500,              // Number: Horas de uso
  "potencia": 155,            // Number: Caballos de fuerza (HP)
  "traccion": "Doble",        // String: Simple, Doble, Oruga
  "condicion": "Usado",       // String: Nuevo, Usado
  "cabina": "Original"        // String: Detalle de cabina (Opcional)
}
```

### C. Categoría: `HERRAMIENTA`
Uso: Tolvas, Tanques, Acoplados, Sembradoras de tiro, Mixers, Cabezales.

```json
{
  "brand": "Cestari",         // String: Marca
  "model": "20000",           // String: Modelo
  "year": 2015,               // Number: Año (Opcional)
  "condicion": "Usado",       // String: Nuevo, Usado
  // Otros campos libres son permitidos, ejemplos:
  "capacidad": "20000 Lts",
  "ancho_labor": "10 mts",
  "neumaticos": "23.1-30"
}
```

---

## 4. Ejemplo de Payload Completo (n8n JSON)

Si estuvieras configurando el nodo HTTP Request en n8n, los datos se verían así:

**Header**: `x-api-key`: `tu_clave_secreta`

**Form-Data Fields**:

*   **category**: `MAQUINARIA`
*   **title**: `Tractor New Holland T7`
*   **price**: `110000`
*   **currency**: `USD`
*   **description**: `Tractor en impecable estado, listo para trabajar. Cubiertas al 80%.`
*   **specs** (String): `{"brand": "New Holland", "model": "T7.195", "year": 2019, "horas": 2100, "potencia": 195, "traccion": "Doble", "condicion": "Usado"}`
*   **images**: `[Binary File 1, Binary File 2...]`

---

## 5. Respuestas de la API

*   **201 Created**:
    ```json
    {
      "success": true,
      "message": "Publicación creada vía Webhook",
      "publicationId": 42,
      "data": { ... }
    }
    ```
*   **401 Unauthorized**: API Key incorrecta.
*   **400 Bad Request**: Faltan campos obligatorios.
