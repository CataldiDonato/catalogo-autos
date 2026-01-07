-- ============================================================
-- CATÁLOGO DE AUTOS - BASE DE DATOS COMPLETA
-- Sistema CRUD con Autenticación JWT
-- ============================================================

-- Limpiar bases de datos previas si existen
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 1. TABLA DE USUARIOS (Autenticación)
-- ============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABLA DE VEHÍCULOS (Catálogo)
-- ============================================================
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Especificaciones Técnicas
  motor VARCHAR(100),
  potencia VARCHAR(50),
  torque VARCHAR(50),
  combustible VARCHAR(50),
  transmision VARCHAR(50),
  traccion VARCHAR(50),
  
  -- Consumo
  consumo_urbano VARCHAR(50),
  consumo_ruta VARCHAR(50),
  consumo_mixto VARCHAR(50),
  
  -- Dimensiones
  largo VARCHAR(50),
  ancho VARCHAR(50),
  alto VARCHAR(50),
  peso VARCHAR(50),
  
  -- Capacidades
  cilindrada VARCHAR(50),
  aceleracion VARCHAR(50),
  velocidad_maxima VARCHAR(50),
  tanque VARCHAR(50),
  maletero VARCHAR(50),
  pasajeros INT DEFAULT 5,
  
  -- Equipamiento (JSON Array)
  equipamiento JSONB DEFAULT '[]'::jsonb,
  
  -- Características de Seguridad (JSON Array)
  seguridad JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TABLA DE CONTACTOS (Formulario de contacto)
-- ============================================================
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================
CREATE INDEX idx_vehicles_brand ON vehicles(brand);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contacts_email ON contacts(email);

-- ============================================================
-- 5. INSERTAR USUARIOS DE PRUEBA
-- ============================================================
-- Contraseñas: admin123, usuario123, usuario456
INSERT INTO users (email, password, name, role) VALUES
('admin@catalogo.com', '$2b$10$YourHashedPasswordHere1', 'Administrador', 'admin'),
('usuario1@example.com', '$2b$10$YourHashedPasswordHere2', 'Usuario Uno', 'user'),
('usuario2@example.com', '$2b$10$YourHashedPasswordHere3', 'Usuario Dos', 'user');

-- ============================================================
-- 6. INSERTAR 30+ VEHÍCULOS PRECARGADOS
-- ============================================================
INSERT INTO vehicles (brand, model, year, price, image_url, description, motor, potencia, torque, combustible, transmision, traccion, consumo_urbano, consumo_ruta, consumo_mixto, largo, ancho, alto, peso, cilindrada, aceleracion, velocidad_maxima, tanque, maletero, pasajeros, equipamiento, seguridad) VALUES

-- VOLKSWAGEN (8 vehículos)
('Volkswagen', 'Gol Trend 1.6', 2024, 18500.00, '/uploads/VolkswagenGolTrend.jpg', 'Sedán confiable ideal para ciudad. Económico y versátil con excelente relación precio-valor.', '1.6L 4 cilindros', '101 HP', '155 Nm', 'Nafta', 'Manual 5v', 'Tracción Delantera', '8.2 km/l', '12.1 km/l', '9.8 km/l', '4.29m', '1.70m', '1.48m', '1150kg', '1598cc', '9.8s', '190 km/h', '50L', '285L', 5, '["Dirección Asistida","Cierre Centralizado","Espejos Eléctricos","Aire Acondicionado"]'::jsonb, '["ABS","Bolsas de Aire","Control de Tracción"]'::jsonb),

('Volkswagen', 'Polo 1.6 MSI Comfortline', 2024, 22800.00, '/uploads/VolkswagenPolo.jpg', 'Hatchback premium con tecnología de punta. Perfecto para conducción urbana con confort superior.', '1.6L 4 cilindros', '110 HP', '160 Nm', 'Nafta', 'Automática 6v', 'Tracción Delantera', '7.1 km/l', '10.2 km/l', '8.4 km/l', '4.05m', '1.75m', '1.47m', '1180kg', '1598cc', '9.3s', '195 km/h', '55L', '305L', 5, '["Pantalla Táctil 6.5 pulgadas","Dirección Asistida","Aire Acondicionado Digital","Espejos Eléctricos","Cierre Centralizado","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire Múltiples","Control de Tracción","Asistente de Frenada"]'::jsonb),

('Volkswagen', 'Virtus 1.6 Highline', 2024, 24500.00, '/uploads/VolkswagenVirtus.jpg', 'Sedán deportivo con diseño europeo. Combina elegancia con desempeño y tecnología de última generación.', '1.6L 4 cilindros TSI', '128 HP', '200 Nm', 'Nafta', 'Automática 8v', 'Tracción Delantera', '6.8 km/l', '9.8 km/l', '8.1 km/l', '4.26m', '1.78m', '1.47m', '1240kg', '1598cc', '8.4s', '210 km/h', '50L', '521L', 5, '["Pantalla 8 pulgadas","Cámara Trasera","Aire Acondicionado Digital","Espejos Eléctricos con Desempañante","Control de Velocidad Crucero","Regulador de Altura del Asiento Conductor"]'::jsonb, '["ABS","Bolsas de Aire Frontales y Laterales","Control Electrónico de Estabilidad","Asistencia al Arranque en Pendiente"]'::jsonb),

('Volkswagen', 'Passat 2.0 TSI Comfortline', 2024, 42000.00, '/uploads/VolkswagenPassat.jpg', 'Sedán ejecutivo con máximas prestaciones. Lujo, confort y tecnología en su máxima expresión.', '2.0L 4 cilindros TSI', '220 HP', '350 Nm', 'Nafta', 'Automática 8v', 'Tracción Delantera', '5.9 km/l', '8.2 km/l', '6.8 km/l', '4.77m', '1.83m', '1.49m', '1480kg', '1984cc', '7.1s', '240 km/h', '70L', '566L', 5, '["Pantalla Táctil 8 pulgadas","Cámara 360°","Cuero Natural","Techo Panorámico","Asientos con Calefacción","Control Automático de Luces","Estacionamiento Automático","Apple CarPlay/Android Auto"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Frenada de Emergencia Automática","Control de Velocidad Adaptativo"]'::jsonb),

('Volkswagen', 'Amarok 2.0 TDI Highline', 2024, 38500.00, '/uploads/VolkswagenAmarok.jpg', 'Camioneta premium con potencia y capacidad de carga. Diseñada para trabajo y aventura.', '2.0L Diésel TDI', '180 HP', '400 Nm', 'Diésel', 'Automática 8v', 'Tracción 4x4', '6.5 km/l', '9.2 km/l', '7.6 km/l', '5.28m', '1.86m', '1.81m', '1850kg', '1968cc', '8.9s', '200 km/h', '80L', '500L', 5, '["Pantalla Táctil 8 pulgadas","Control de Tracción 4x4","Diferenciales","Aire Acondicionado Dual","Cámara Trasera","Espejos con Calefacción","Cierre Centralizado con Control Remoto"]'::jsonb, '["ABS","Bolsas de Aire Múltiples","Control Electrónico de Estabilidad","Sistema de Asistencia en Bajadas"]'::jsonb),

('Volkswagen', 'T-Cross 1.0 TSI Comfortline', 2024, 26800.00, '/uploads/VolkswagenTcross.jpg', 'SUV compacto con versatilidad y dinamismo. Perfecto para la familia moderna con estilo robusto.', '1.0L 3 cilindros TSI', '116 HP', '200 Nm', 'Nafta', 'Automática 6v', 'Tracción Delantera', '7.2 km/l', '10.1 km/l', '8.3 km/l', '4.11m', '1.77m', '1.57m', '1260kg', '999cc', '9.1s', '205 km/h', '50L', '385L', 5, '["Pantalla 6.5 pulgadas","Cámara Trasera","Dirección Asistida","Aire Acondicionado","Espejos Eléctricos","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 6","Control de Tracción","Asistente de Frenada"]'::jsonb),

('Volkswagen', 'Tiguan 1.4 TSI Comfortline', 2024, 36500.00, '/uploads/VolkswagenTiguan.jpg', 'SUV deportivo y espacioso con tecnología inteligente. Diseño robusto con interior lujoso y confortable.', '1.4L 4 cilindros TSI', '150 HP', '250 Nm', 'Nafta', 'Automática 7v DSG', 'Tracción Delantera', '7.8 km/l', '11.2 km/l', '9.1 km/l', '4.50m', '1.84m', '1.59m', '1495kg', '1395cc', '8.5s', '215 km/h', '60L', '605L', 5, '["Pantalla Táctil 8 pulgadas","Cámara 360°","Techo Panorámico","Navegador GPS","Aire Acondicionado Digital","Control Crucero Adaptativo","Estacionamiento Automático"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Detector de Peatones","Frenada de Emergencia Automática"]'::jsonb),

('Volkswagen', 'Jetta 1.4 TSI Highline', 2024, 31200.00, '/uploads/VolkswagenJetta.jpg', 'Sedán moderno con líneas atractivas. Tecnología avanzada con confort para toda la familia.', '1.4L 4 cilindros TSI', '150 HP', '250 Nm', 'Nafta', 'Automática 8v', 'Tracción Delantera', '7.1 km/l', '10.3 km/l', '8.5 km/l', '4.67m', '1.82m', '1.48m', '1380kg', '1395cc', '8.2s', '215 km/h', '55L', '507L', 5, '["Pantalla Táctil 8 pulgadas","Cámara Trasera","Control de Crucero Adaptativo","Aire Acondicionado Digital","Conectividad Bluetooth","Asientos Tapizados","Dirección Asistida"]'::jsonb, '["ABS","Bolsas de Aire Múltiples","Control Electrónico de Estabilidad","Asistencia en Pendiente"]'::jsonb),

-- FORD (8 vehículos)
('Ford', 'Fiesta 1.6 Titanium', 2024, 19800.00, '/uploads/FordfIESTA.jpg', 'Hatchback joven y dinámico. Ágil en ciudad con estilo deportivo y tecnología moderna.', '1.6L 4 cilindros', '120 HP', '150 Nm', 'Nafta', 'Manual 5v', 'Tracción Delantera', '7.8 km/l', '11.2 km/l', '9.2 km/l', '3.94m', '1.70m', '1.47m', '1160kg', '1596cc', '8.9s', '200 km/h', '50L', '282L', 5, '["Pantalla 6.5 pulgadas","Dirección Asistida","Aire Acondicionado","Espejos Eléctricos","Cierre Centralizado"]'::jsonb, '["ABS","Bolsas de Aire","Control de Tracción"]'::jsonb),

('Ford', 'Focus 2.0 SE', 2024, 25600.00, '/uploads/FordfOCUS.jpg', 'Hatchback moderno con tecnología de punta. Combinación perfecta de desempeño y eficiencia.', '2.0L 4 cilindros', '160 HP', '190 Nm', 'Nafta', 'Automática 6v', 'Tracción Delantera', '6.9 km/l', '9.8 km/l', '8.2 km/l', '4.37m', '1.82m', '1.50m', '1310kg', '1998cc', '7.8s', '220 km/h', '55L', '380L', 5, '["Pantalla Táctil 8 pulgadas","Cámara Trasera","Apple CarPlay/Android Auto","Aire Acondicionado Digital","Control de Crucero","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Frenada de Emergencia Automática"]'::jsonb),

('Ford', 'Mondeo 2.0 Ecoboost Titanium', 2024, 40200.00, '/uploads/FordMondeo.jpg', 'Sedán ejecutivo europeo con lujo y desempeño. Tecnología inteligente para conducción refinada.', '2.0L 4 cilindros Ecoboost', '240 HP', '350 Nm', 'Nafta', 'Automática 8v', 'Tracción Delantera', '5.8 km/l', '8.5 km/l', '7.0 km/l', '4.87m', '1.85m', '1.49m', '1560kg', '1999cc', '6.9s', '245 km/h', '70L', '510L', 5, '["Pantalla Táctil 8 pulgadas","Cámara 360°","Cuero Premium","Techo Panorámico","Navegador GPS","Asientos con Calefacción y Ventilación","Control Automático de Luces"]'::jsonb, '["ABS","Bolsas de Aire 10","Control Electrónico de Estabilidad","Frenada de Emergencia Autónoma","Monitor de Presión de Llantas"]'::jsonb),

('Ford', 'EcoSport 1.5L SE', 2024, 21900.00, '/uploads/FordEcoSport.jpg', 'SUV compacto con practicidad y confort. Diseño robusto perfecto para ciudad y campo.', '1.5L 3 cilindros Ecoboost', '123 HP', '150 Nm', 'Nafta', 'Automática 6v', 'Tracción Delantera', '7.4 km/l', '10.5 km/l', '8.6 km/l', '4.19m', '1.79m', '1.60m', '1280kg', '1498cc', '8.6s', '205 km/h', '52L', '335L', 5, '["Pantalla 6.5 pulgadas","Aire Acondicionado Manual","Dirección Asistida","Espejos Eléctricos","Sensores de Estacionamiento Traseros"]'::jsonb, '["ABS","Bolsas de Aire 6","Control de Tracción","Alerta de Colisión"]'::jsonb),

('Ford', 'Edge 2.0 Ecoboost Titanium', 2024, 52000.00, '/uploads/FordEdge.jpg', 'SUV deportivo de 3 filas con lujo y espaciosidad. Desempeño excepcional con tecnología avanzada.', '2.0L 4 cilindros Ecoboost', '250 HP', '390 Nm', 'Nafta', 'Automática 8v', 'Tracción Inteligente', '7.2 km/l', '10.0 km/l', '8.4 km/l', '4.84m', '1.90m', '1.69m', '1680kg', '1999cc', '7.2s', '235 km/h', '70L', '593L', 7, '["Pantalla Táctil 8 pulgadas","Cámara 360°","Cuero Premium","Techo Panorámico","Navegador GPS Integrado","Asientos con Calefacción","Tercera Fila de Asientos","Apple CarPlay/Android Auto"]'::jsonb, '["ABS","Bolsas de Aire 10","Control Electrónico de Estabilidad","Frenada Automática de Emergencia","Monitor de Punto Ciego"]'::jsonb),

('Ford', 'Ranger 2.2L XLT', 2024, 35400.00, '/uploads/FordRanger.jpg', 'Camioneta pickup potente y versátil. Diseñada para el trabajo con comfort y tecnología moderna.', '2.2L 4 cilindros Diésel', '150 HP', '390 Nm', 'Diésel', 'Automática 6v', 'Tracción 4x4 Selectiva', '7.1 km/l', '9.8 km/l', '8.2 km/l', '5.31m', '1.86m', '1.80m', '1780kg', '2198cc', '9.2s', '190 km/h', '80L', '405L', 5, '["Pantalla Táctil 6.5 pulgadas","Cámara Trasera","Control de Tracción 4x4","Aire Acondicionado Dual","Espejos con Calefacción","Cierre Centralizado"]'::jsonb, '["ABS","Bolsas de Aire 6","Control Electrónico de Estabilidad","Sistema de Asistencia en Bajadas"]'::jsonb),

('Ford', 'Mustang 5.0L GT', 2024, 55000.00, '/uploads/FordMustang.jpg', 'Muscle car icónico con potencia extrema. Desempeño de competición con estilo legendario.', '5.0L V8 Gasolina', '480 HP', '569 Nm', 'Nafta Premium', 'Automática 10v', 'Tracción Trasera', '7.8 km/l', '11.5 km/l', '9.2 km/l', '4.78m', '1.93m', '1.41m', '1620kg', '4951cc', '3.9s', '270 km/h', '59L', '382L', 4, '["Pantalla Táctil 12 pulgadas","Cámara 360°","Cuero Premium","Techo Convertible","Navegador GPS","Asientos Calefaccionados","Sonido Premium","Apple CarPlay/Android Auto"]'::jsonb, '["ABS","Bolsas de Aire 8","Control de Tracción","Sistema de Frenado Deportivo","Alerta de Colisión"]'::jsonb),

('Ford', 'Escape 2.0L Titanium', 2024, 33600.00, '/uploads/FordeSCAPE.avif', 'SUV compacto versátil con tecnología inteligente. Perfecto para familias activas con estilo.', '2.0L 4 cilindros Ecoboost', '250 HP', '390 Nm', 'Nafta', 'Automática 8v', 'Tracción Inteligente', '8.1 km/l', '11.3 km/l', '9.4 km/l', '4.63m', '1.88m', '1.64m', '1560kg', '1999cc', '7.1s', '225 km/h', '60L', '577L', 5, '["Pantalla Táctil 8 pulgadas","Cámara Trasera","Apple CarPlay/Android Auto","Aire Acondicionado Digital","Navegador","Asientos con Calefacción","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Frenada de Emergencia Automática"]'::jsonb),

-- FIAT (8 vehículos)
('Fiat', 'Argo 1.3 Drive', 2024, 16500.00, '/uploads/FiatArgo.jpg', 'Hatchback práctico y económico. Ideal para ciudad con excelente consumo de combustible.', '1.3L 4 cilindros Multijet', '75 HP', '190 Nm', 'Diésel', 'Manual 5v', 'Tracción Delantera', '16.2 km/l', '21.3 km/l', '18.5 km/l', '4.03m', '1.68m', '1.55m', '1080kg', '1248cc', '10.5s', '180 km/h', '45L', '265L', 5, '["Dirección Asistida","Cierre Centralizado","Aire Acondicionado","Espejos Eléctricos"]'::jsonb, '["ABS","Bolsas de Aire","Control de Tracción"]'::jsonb),

('Fiat', 'Argo 1.8 HGT', 2024, 20300.00, '/uploads/FiatArgoHGT.jpg', 'Hatchback deportivo con diseño juvenil. Tecnología moderna con desempeño ágil.', '1.8L 4 cilindros Gasolina', '138 HP', '175 Nm', 'Nafta', 'Automática CVT', 'Tracción Delantera', '7.9 km/l', '11.5 km/l', '9.4 km/l', '4.03m', '1.68m', '1.55m', '1150kg', '1798cc', '8.1s', '210 km/h', '50L', '265L', 5, '["Pantalla Táctil 7 pulgadas","Cámara Trasera","Aire Acondicionado Digital","Espejos Eléctricos","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 6","Control de Tracción","Alerta de Colisión"]'::jsonb),

('Fiat', 'Cronos 1.3 Drive', 2024, 19200.00, '/uploads/FiatCronos.jpg', 'Sedán compacto económico y práctico. Excelente opción para familias con presupuesto limitado.', '1.3L 4 cilindros Multijet', '75 HP', '190 Nm', 'Diésel', 'Manual 5v', 'Tracción Delantera', '15.8 km/l', '20.9 km/l', '18.1 km/l', '4.43m', '1.70m', '1.53m', '1140kg', '1248cc', '10.3s', '185 km/h', '50L', '300L', 5, '["Dirección Asistida","Aire Acondicionado","Cierre Centralizado","Espejos Eléctricos"]'::jsonb, '["ABS","Bolsas de Aire","Control de Tracción"]'::jsonb),

('Fiat', 'Cronos 1.8 HGT Plus', 2024, 24800.00, '/uploads/FiatCronosPlus.jpg', 'Sedán deportivo con equipamiento completo. Tecnología avanzada con confort superior.', '1.8L 4 cilindros Gasolina', '138 HP', '175 Nm', 'Nafta', 'Automática 6v', 'Tracción Delantera', '7.6 km/l', '11.2 km/l', '9.1 km/l', '4.43m', '1.70m', '1.53m', '1220kg', '1798cc', '7.9s', '215 km/h', '55L', '300L', 5, '["Pantalla Táctil 7 pulgadas","Cámara Trasera","Aire Acondicionado Digital","Navegador","Asientos con Calefacción","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Asistencia en Pendiente"]'::jsonb),

('Fiat', 'Strada 1.4 Working', 2024, 21700.00, '/uploads/FiatStrada.jpg', 'Pickup versátil con cabina moderna. Perfecta para trabajo y uso comercial con confiabilidad.', '1.4L 8v Gasolina', '86 HP', '130 Nm', 'Nafta', 'Manual 5v', 'Tracción Trasera', '7.8 km/l', '11.0 km/l', '9.1 km/l', '4.94m', '1.68m', '1.77m', '1280kg', '1368cc', '10.1s', '190 km/h', '50L', '500L', 2, '["Dirección Asistida","Aire Acondicionado","Cierre Centralizado","Espejos Eléctricos"]'::jsonb, '["ABS","Bolsas de Aire Frontales","Control de Tracción"]'::jsonb),

('Fiat', 'Toro 2.0 AT9', 2024, 32400.00, '/uploads/FiatToro.jpg', 'Camioneta moderna con potencia y confort. Diseño robusto para trabajo y familia.', '2.0L 4 cilindros Diésel', '170 HP', '400 Nm', 'Diésel', 'Automática 9v', 'Tracción 4x4 Inteligente', '6.8 km/l', '9.5 km/l', '7.9 km/l', '5.25m', '1.85m', '1.77m', '1850kg', '1956cc', '8.3s', '210 km/h', '80L', '500L', 5, '["Pantalla Táctil 8 pulgadas","Cámara 360°","Control de Tracción 4x4","Aire Acondicionado Dual","Navegador GPS","Asientos con Calefacción","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Frenada de Emergencia Automática"]'::jsonb),

('Fiat', '500 1.2 8v Pop', 2024, 19900.00, '/uploads/Fiat500.jpg', 'Citycars icónico con estilo retro y moderno. Perfecto para ciudad con diseño único.', '1.2L 4 cilindros', '69 HP', '102 Nm', 'Nafta', 'Manual 5v', 'Tracción Delantera', '15.7 km/l', '20.1 km/l', '17.5 km/l', '3.57m', '1.63m', '1.52m', '865kg', '1242cc', '11.2s', '170 km/h', '40L', '185L', 4, '["Dirección Asistida","Cierre Centralizado","Aire Acondicionado","Espejos Manuales"]'::jsonb, '["ABS","Bolsas de Aire Frontales","Control de Tracción"]'::jsonb),

('Fiat', 'X1H 1.4L Flex', 2024, 28500.00, '/uploads/FiatX1H.jpg', 'SUV con versatilidad y practicidad. Diseño robusto con confort para toda la familia.', '1.4L Flex Gasolina/Etanol', '110 HP', '150 Nm', 'Nafta/Etanol', 'Automática 6v', 'Tracción Delantera', '8.5 km/l', '11.8 km/l', '9.9 km/l', '4.38m', '1.77m', '1.68m', '1380kg', '1368cc', '9.8s', '200 km/h', '55L', '380L', 5, '["Pantalla Táctil 6.5 pulgadas","Cámara Trasera","Aire Acondicionado","Espejos Eléctricos","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 6","Control de Tracción","Alerta de Colisión"]'::jsonb),

-- RENAULT (8 vehículos)
('Renault', 'Kwid 1.0 Expression', 2024, 16500.00, '/uploads/RenaultKwid.jpg', 'Crossover urbano con practicidad. Económico y versátil para conducción en ciudad.', '1.0L 3 cilindros Gasolina', '66 HP', '91 Nm', 'Nafta', 'Manual 5v', 'Tracción Delantera', '15.3 km/l', '20.5 km/l', '17.4 km/l', '3.82m', '1.65m', '1.54m', '885kg', '999cc', '11.8s', '170 km/h', '40L', '245L', 5, '["Dirección Asistida","Cierre Centralizado","Aire Acondicionado","Espejos Eléctricos"]'::jsonb, '["ABS","Bolsas de Aire Frontales","Control de Tracción"]'::jsonb),

('Renault', 'Sandero 1.6 Expression', 2024, 18800.00, '/uploads/RenaultSandero.jpg', 'Hatchback familiar y práctico. Versátil para ciudad y ruta con buen espacio interior.', '1.6L 4 cilindros Gasolina', '110 HP', '145 Nm', 'Nafta', 'Manual 5v', 'Tracción Delantera', '7.8 km/l', '11.2 km/l', '9.2 km/l', '4.39m', '1.83m', '1.52m', '1200kg', '1598cc', '9.5s', '190 km/h', '50L', '420L', 5, '["Pantalla 6.5 pulgadas","Dirección Asistida","Aire Acondicionado","Espejos Eléctricos","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire","Control de Tracción"]'::jsonb),

('Renault', 'Megane 1.6 Zen', 2024, 26400.00, '/uploads/RenaultMegane.jpg', 'Hatchback deportivo con diseño moderno. Tecnología avanzada para conducción ágil y segura.', '1.6L 4 cilindros Gasolina Turbo', '165 HP', '250 Nm', 'Nafta', 'Automática 7v DCT', 'Tracción Delantera', '6.5 km/l', '9.2 km/l', '7.6 km/l', '4.28m', '1.86m', '1.49m', '1320kg', '1598cc', '8.0s', '220 km/h', '55L', '405L', 5, '["Pantalla Táctil 8 pulgadas","Cámara Trasera","Apple CarPlay/Android Auto","Aire Acondicionado Digital","Navegador GPS","Asientos con Calefacción"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Frenada de Emergencia Automática"]'::jsonb),

('Renault', 'Captur 1.6 Expression', 2024, 22900.00, '/uploads/RenaultCaptur.jpg', 'SUV compacto con estilo y practicidad. Perfecto para familias con confort y versatilidad.', '1.6L 4 cilindros Gasolina', '115 HP', '156 Nm', 'Nafta', 'Automática CVT', 'Tracción Delantera', '8.3 km/l', '11.8 km/l', '9.8 km/l', '4.18m', '1.85m', '1.57m', '1200kg', '1598cc', '9.2s', '195 km/h', '50L', '360L', 5, '["Pantalla 6.5 pulgadas","Cámara Trasera","Aire Acondicionado","Espejos Eléctricos","Sensores de Estacionamiento"]'::jsonb, '["ABS","Bolsas de Aire 6","Control de Tracción","Alerta de Colisión"]'::jsonb),

('Renault', 'Duster 1.6 Expression', 2024, 24500.00, '/uploads/RenaultDuster.jpg', 'SUV robusto con capacidad todo-terreno. Aventura y practicidad en un mismo vehículo.', '1.6L 4 cilindros Gasolina', '115 HP', '156 Nm', 'Nafta', 'Manual 5v', 'Tracción Delantera', '8.1 km/l', '11.5 km/l', '9.6 km/l', '4.32m', '1.82m', '1.60m', '1240kg', '1598cc', '9.8s', '195 km/h', '60L', '475L', 5, '["Dirección Asistida","Aire Acondicionado","Espejos Eléctricos","Sensores de Estacionamiento","Cierre Centralizado"]'::jsonb, '["ABS","Bolsas de Aire 6","Control de Tracción","Sistema de Asistencia en Bajadas"]'::jsonb),

('Renault', 'Koleos 2.0 Intens', 2024, 42800.00, '/uploads/RenaultKoleos.jpg', 'SUV ejecutivo con lujo y confort supremo. Tecnología avanzada para viajes de largo aliento.', '2.0L 4 cilindros Gasolina Turbo', '235 HP', '320 Nm', 'Nafta', 'Automática CVT', 'Tracción Inteligente', '8.2 km/l', '11.5 km/l', '9.6 km/l', '4.67m', '1.90m', '1.60m', '1560kg', '1997cc', '7.8s', '225 km/h', '60L', '580L', 5, '["Pantalla Táctil 8.7 pulgadas","Cámara 360°","Cuero Premium","Techo Panorámico","Navegador GPS Integrado","Asientos Masajeantes","Control de Crucero Adaptativo","Apple CarPlay/Android Auto"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Frenada de Emergencia Autónoma","Monitor de Punto Ciego"]'::jsonb),

('Renault', 'Scenic 1.6 Dynamique', 2024, 29800.00, '/uploads/RenaultScenic.jpg', 'Monovolumen versátil con espacio y confort. Perfecto para familias numerosas con estilo europeo.', '1.6L 4 cilindros Gasolina Turbo', '130 HP', '200 Nm', 'Nafta', 'Automática 7v CVT', 'Tracción Delantera', '7.1 km/l', '10.2 km/l', '8.4 km/l', '4.41m', '1.84m', '1.59m', '1380kg', '1598cc', '8.7s', '210 km/h', '55L', '520L', 7, '["Pantalla Táctil 7 pulgadas","Cámara Trasera","Apple CarPlay/Android Auto","Aire Acondicionado Dual","Navegador GPS","Asientos Deslizables"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Alerta de Colisión"]'::jsonb),

('Renault', 'Espace 3.5L V6', 2024, 48500.00, '/uploads/RenaultEspace.jpg', 'Monovolumen de lujo con 7 plazas. Máximo confort y tecnología para viajes familiares extensos.', '3.5L V6 Gasolina', '260 HP', '340 Nm', 'Nafta Premium', 'Automática 6v', 'Tracción Delantera', '7.8 km/l', '10.5 km/l', '8.9 km/l', '4.87m', '1.88m', '1.66m', '1650kg', '3498cc', '7.9s', '230 km/h', '70L', '550L', 7, '["Pantalla Táctil 8.3 pulgadas","Cámara 360°","Cuero Premium","Techo Panorámico","Navegador GPS","Asientos con Masaje","Control de Velocidad Adaptativo"]'::jsonb, '["ABS","Bolsas de Aire 8","Control Electrónico de Estabilidad","Frenada Autónoma"]'::jsonb);

-- ============================================================
-- 7. RESUMEN
-- ============================================================
-- Total de vehículos: 32
-- Total de usuarios: 3
-- Total de contactos: 0 (se llena mediante formulario)
-- Tablas creadas: users, vehicles, contacts
-- Índices creados: 5 (para optimizar búsquedas)
