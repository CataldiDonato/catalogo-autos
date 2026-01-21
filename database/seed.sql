-- Insertar usuario administrador
INSERT INTO users (email, password, name, role) 
VALUES ('admin@test.com', '$2a$10$zxa1NHRDEwEI7oSR7v.ZkeeGfK5LzTgrVG0/y6ztq..GvkhuYo8oK', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar publicaciones de prueba
INSERT INTO publications (title, price, currency, description, category, specs)
VALUES 
('Tractor John Deere 6155M', 150000, 'USD', 'Tractor John Deere Modelo 6155M, Año 2023, 0 horas. Transmisión PowerQuad.', 'VEHICULO', '{"marca": "John Deere", "modelo": "6155M", "anio": 2023, "horas": 0, "potencia": "155 HP"}'),
('Sembradora Agrometal TX Mega', 85000, 'USD', 'Sembradora Agrometal TX Mega de granos gruesos. 16 surcos a 52cm.', 'MAQUINARIA', '{"marca": "Agrometal", "modelo": "TX Mega", "anio": 2022, "surcos": 16, "distancia": "52cm"}');
