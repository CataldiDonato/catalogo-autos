-- Migración: Agregar soporte de múltiples imágenes por vehículo
-- Esta migración añade la tabla vehicle_images y actualiza la tabla vehicles

-- 1. Hacer que image_url sea opcional (para vehículos antiguos)
ALTER TABLE vehicles ALTER COLUMN image_url DROP NOT NULL;

-- 2. Crear tabla para almacenar múltiples imágenes
CREATE TABLE IF NOT EXISTS vehicle_images (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_is_cover ON vehicle_images(is_cover);

-- 4. (OPCIONAL) Si ya tienes datos en image_url, ejecuta esto para migrarlos:
-- INSERT INTO vehicle_images (vehicle_id, image_path, is_cover, position)
-- SELECT id, image_url, TRUE, 0 FROM vehicles WHERE image_url IS NOT NULL;
