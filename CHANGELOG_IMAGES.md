# Implementación: Sistema de Múltiples Imágenes y Carrusel

## Resumen de Cambios

Se ha implementado un sistema completo de **carga de múltiples imágenes** por vehículo en lugar de una única URL. La primera imagen subida se establece automáticamente como **portada**. Las imágenes se muestran en un **carrusel interactivo** en la página de detalle del auto.

## 📁 Archivos Modificados

### Backend (Servidor)

1. **`server/server.js`**

   - ✅ Agregado soporte para `multer` (middleware para carga de archivos)
   - ✅ Nueva ruta `POST /api/upload` - Carga archivos de imagen
   - ✅ Actualizado `POST /api/vehicles` - Maneja múltiples imágenes
   - ✅ Actualizado `PUT /api/vehicles/:id` - Actualiza imágenes
   - ✅ Actualizado `GET /api/vehicles` y `GET /api/vehicles/:id` - Retorna array de imágenes con metadatos

2. **`server/package.json`**
   - ✅ Agregada dependencia: `multer` (^1.4.5)

### Base de Datos

1. **`database/schema.sql`**

   - ✅ Actualizado - `image_url` ahora es opcional (NULL)
   - ✅ Nueva tabla `vehicle_images` con:
     - `id`: ID único
     - `vehicle_id`: Referencia al vehículo
     - `image_path`: Ruta de la imagen
     - `is_cover`: Indica si es la portada
     - `position`: Orden de las imágenes
     - `created_at`: Timestamp

2. **`database/migration_add_images.sql`** (NUEVO)
   - Script para ejecutar la migración en BD existentes
   - Incluye sentencias SQL para actualizar tablas

### Frontend - Cliente

1. **`client/src/config.js`**

   - ✅ Agregado endpoint: `UPLOAD: /api/upload`

2. **`client/src/components/AdminPanel.jsx`**

   - ✅ Reemplazado input de "URL de Imagen" por input de **archivos múltiples**
   - ✅ Agregada **vista previa de imágenes** en el formulario
   - ✅ La primera imagen se marca como **"Portada"** (borde azul)
   - ✅ Posibilidad de remover imágenes antes de guardar
   - ✅ Contador de imágenes seleccionadas
   - ✅ Integración con endpoint de upload

3. **`client/src/pages/CarDetail.jsx`**

   - ✅ Implementado **carrusel de imágenes** completo con:
     - Botones de navegación (anterior/siguiente)
     - Miniaturas interactivas para saltar a una imagen específica
     - Indicador de posición (ej: 1/5)
     - Compatibilidad con retrocompatibilidad (`image_url` antiguo)

4. **`client/src/components/VehicleCard.jsx`**
   - ✅ Actualizado para mostrar la **imagen de portada** automáticamente
   - ✅ Indicador visual cuando hay múltiples imágenes (📸 badge)

## 🚀 Instalación y Configuración

### 1. Instalar dependencias del servidor

```bash
cd server
npm install
```

### 2. Ejecutar la migración en la base de datos

```bash
# Conectarse a PostgreSQL
psql -U postgres -d catalogo_autos -f ../database/migration_add_images.sql

# O manualmente:
# - Crear tabla vehicle_images
# - Hacer image_url opcional
# - Crear índices
```

### 3. Crear directorio de uploads (si no existe)

```bash
mkdir -p client/public/uploads
```

### 4. Reiniciar el servidor

```bash
npm start
```

## 📝 Uso

### Crear un nuevo auto:

1. En el Panel de Administración, haz clic en **"+ Agregar Nuevo Vehículo"**
2. Completa los campos de marca, modelo, año, precio, etc.
3. **En lugar de URL de imagen**, ahora hay un campo **"Fotos del Auto"**
4. Selecciona **una o varias imágenes** (JPG, PNG, WebP, AVIF)
5. Las imágenes se mostrarán en vista previa - **la primera es la portada** (con borde azul)
6. Puedes remover imágenes antes de guardar
7. Haz clic en **"Crear Vehículo"**

### Editar un auto:

1. Haz clic en **"Editar"** en la lista de vehículos
2. Puedes ver la portada actual
3. Selecciona **nuevas imágenes** para reemplazar (opcional)
4. O deja las imágenes actuales si no quieres cambiarlas
5. Haz clic en **"Actualizar Vehículo"**

### Ver el carrusel:

1. En el catálogo, haz clic en cualquier auto
2. En la página de detalle verás la **imagen principal**
3. Si hay más de una imagen:
   - Usa los **botones de flechas** (← →) para navegar
   - O haz clic en las **miniaturas** abajo para saltar
   - El **indicador** muestra: foto actual / total de fotos

## 🎨 Características

### Carrusel de Imágenes

- ✅ Navegación con flechas (anterior/siguiente)
- ✅ Miniaturas interactivas
- ✅ Indicador de posición (ej: 2/5)
- ✅ Responde al teclado (se puede mejorar)

### Admin Panel

- ✅ Vista previa en tiempo real de imágenes seleccionadas
- ✅ Drag & Drop compatible (navegador nativo)
- ✅ Máximo 20 imágenes por vehículo
- ✅ Máximo 10MB por archivo
- ✅ Formatos soportados: JPG, PNG, WebP, AVIF

### Retrocompatibilidad

- ✅ Autos antiguos con `image_url` siguen funcionando
- ✅ Se detecta automáticamente si hay imágenes en tabla o URL antigua

## 🔧 Detalles Técnicos

### Estructura de datos de imágenes (API)

```javascript
{
  "id": 1,
  "brand": "Ford",
  "model": "Escape",
  // ... otros campos ...
  "images": [
    {
      "id": 101,
      "image_path": "/uploads/escape-1704067200000-123456.jpg",
      "is_cover": true,
      "position": 0
    },
    {
      "id": 102,
      "image_path": "/uploads/escape-1704067200000-789012.jpg",
      "is_cover": false,
      "position": 1
    }
  ]
}
```

### Rutas de API

```
POST   /api/upload                   - Cargar archivos (requiere autenticación)
GET    /api/vehicles                 - Obtener todos (incluye imágenes)
GET    /api/vehicles/:id             - Obtener uno (incluye imágenes)
POST   /api/vehicles                 - Crear (requiere imágenes)
PUT    /api/vehicles/:id             - Actualizar (imágenes opcionales)
DELETE /api/vehicles/:id             - Eliminar
```

## 🐛 Troubleshooting

### Las imágenes no se cargan

- Verifica que `client/public/uploads/` existe y tiene permisos de escritura
- Revisa la consola del navegador (F12) para errores
- Confirma que el servidor tiene permiso para escribir en la carpeta

### Error 413 al subir archivos

- Aumenta el límite en `server.js` en la configuración de multer
- Actualmente: 10MB por archivo
- Máx 20 archivos por request

### Las imágenes antiguas desaparecen

- Los datos antiguos en `image_url` se conservan
- Cuando subes nuevas imágenes reemplazan las antiguas
- Para migrar datos antiguos, ejecuta el comentario en `migration_add_images.sql`

## 📚 Referencias

- [Multer Documentation](https://github.com/expressjs/multer)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [React File Input](https://react.dev/reference/react-dom/components/input#type)

## ✅ Checklist de Implementación

- [x] Crear tabla `vehicle_images`
- [x] Implementar endpoint `/api/upload`
- [x] Actualizar rutas POST/PUT de vehículos
- [x] Actualizar rutas GET para retornar imágenes
- [x] Actualizar AdminPanel con input de archivos
- [x] Agregar vista previa de imágenes
- [x] Implementar carrusel en CarDetail
- [x] Implementar miniaturas interactivas
- [x] Actualizar VehicleCard para usar portada
- [x] Agregar badge de múltiples fotos
- [x] Mantener retrocompatibilidad con `image_url`

---

**Versión:** 1.0
**Fecha:** Enero 2026
**Estado:** ✅ Completado
