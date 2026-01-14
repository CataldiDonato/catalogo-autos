-- Crear tipo ENUM para categorías
DO $$ BEGIN
    CREATE TYPE publication_category AS ENUM ('VEHICULO', 'MAQUINARIA', 'HERRAMIENTA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla publications
-- Crear tabla publications
CREATE TABLE IF NOT EXISTS publications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    description TEXT,
    category publication_category NOT NULL,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla contacts
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla publication_images
CREATE TABLE IF NOT EXISTS publication_images (
  id SERIAL PRIMARY KEY,
  publication_id INT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_publications_category ON publications(category);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_publication_images_publication_id ON publication_images(publication_id);
