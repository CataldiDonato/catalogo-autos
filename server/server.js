const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const initializeDatabase = require("./initDB");
const authMiddleware = require("./middleware/auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, "../client/public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));
app.use("/uploads", express.static(uploadsDir));

// Configurar conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "catalogo_autos",
});

// Probar conexión a la base de datos
pool.on("connect", () => {
  console.log("✓ Conectado a PostgreSQL exitosamente");
});

pool.on("error", (err) => {
  console.error("Error en el pool de conexión:", err);
});

// ==================== RUTAS DE AUTENTICACIÓN ====================

// POST /api/auth/register - Registrar nuevo usuario
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Email, contraseña y nombre son requeridos" });
  }

  try {
    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await pool.query(
      "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name",
      [email, hashedPassword, name, "user"]
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// POST /api/auth/login - Iniciar sesión
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Sesión iniciada exitosamente",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// ==================== RUTAS DE VEHÍCULOS ====================

// GET /api/vehicles - Obtener todos los autos (Público)
app.get("/api/vehicles", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, 
              json_agg(json_build_object('id', vi.id, 'image_path', vi.image_path, 'is_cover', vi.is_cover, 'position', vi.position)) as images
       FROM vehicles v
       LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
       GROUP BY v.id
       ORDER BY v.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener vehículos:", err);
    res.status(500).json({ error: "Error al obtener vehículos" });
  }
});

// GET /api/vehicles/:id - Obtener un auto específico (Público)
app.get("/api/vehicles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT v.*, 
              json_agg(json_build_object('id', vi.id, 'image_path', vi.image_path, 'is_cover', vi.is_cover, 'position', vi.position)) as images
       FROM vehicles v
       LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
       WHERE v.id = $1
       GROUP BY v.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener vehículo:", err);
    res.status(500).json({ error: "Error al obtener vehículo" });
  }
});

// POST /api/contact - Guardar un mensaje de contacto
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Validar que los campos requeridos existan
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email, message]
    );
    res.status(201).json({
      success: true,
      message: "Mensaje guardado exitosamente",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error al guardar contacto:", err);
    res.status(500).json({ error: "Error al guardar el mensaje" });
  }
});

// ==================== RUTAS CRUD PROTEGIDAS ====================

// POST /api/upload - Cargar imágenes (Protegido)
app.post(
  "/api/upload",
  authMiddleware,
  upload.array("images", 20),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No se cargaron archivos" });
      }

      const uploadedFiles = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        size: file.size,
      }));

      res.json({
        success: true,
        message: "Archivos cargados exitosamente",
        files: uploadedFiles,
      });
    } catch (err) {
      console.error("Error al cargar archivos:", err);
      res.status(500).json({ error: "Error al cargar archivos" });
    }
  }
);

// POST /api/vehicles - Crear nuevo vehículo (Protegido)
app.post("/api/vehicles", authMiddleware, async (req, res) => {
  const { brand, model, year, price, description, images, ...specs } = req.body;

  if (
    !brand ||
    !model ||
    !year ||
    !price ||
    !description ||
    !images ||
    images.length === 0
  ) {
    return res.status(400).json({ error: "Campos requeridos faltantes" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Crear vehículo
    const vehicleResult = await client.query(
      `INSERT INTO vehicles 
       (brand, model, year, price, description, motor, potencia, torque, 
        combustible, transmision, traccion, consumo_urbano, consumo_ruta, consumo_mixto, 
        largo, ancho, alto, peso, cilindrada, aceleracion, velocidad_maxima, tanque, maletero, 
        equipamiento, seguridad) 
       VALUES 
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
        $19, $20, $21, $22, $23, $24, $25) 
       RETURNING *`,
      [
        brand,
        model,
        year,
        price,
        description,
        specs.motor,
        specs.potencia,
        specs.torque,
        specs.combustible,
        specs.transmision,
        specs.traccion,
        specs.consumo_urbano,
        specs.consumo_ruta,
        specs.consumo_mixto,
        specs.largo,
        specs.ancho,
        specs.alto,
        specs.peso,
        specs.cilindrada,
        specs.aceleracion,
        specs.velocidad_maxima,
        specs.tanque,
        specs.maletero,
        JSON.stringify(specs.equipamiento || []),
        JSON.stringify(specs.seguridad || []),
      ]
    );

    const vehicleId = vehicleResult.rows[0].id;

    // Agregar imágenes
    const imageArray = Array.isArray(images) ? images : [images];
    for (let i = 0; i < imageArray.length; i++) {
      await client.query(
        `INSERT INTO vehicle_images (vehicle_id, image_path, is_cover, position)
         VALUES ($1, $2, $3, $4)`,
        [vehicleId, imageArray[i], i === 0, i]
      );
    }

    await client.query("COMMIT");

    // Obtener vehículo con imágenes
    const vehicleWithImages = await pool.query(
      `SELECT v.*, 
              json_agg(json_build_object('id', vi.id, 'image_path', vi.image_path, 'is_cover', vi.is_cover, 'position', vi.position)) as images
       FROM vehicles v
       LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
       WHERE v.id = $1
       GROUP BY v.id`,
      [vehicleId]
    );

    res.status(201).json({
      success: true,
      message: "Vehículo creado exitosamente",
      data: vehicleWithImages.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al crear vehículo:", err);
    res.status(500).json({ error: "Error al crear vehículo" });
  } finally {
    client.release();
  }
});

// PUT /api/vehicles/:id - Actualizar vehículo (Protegido)
app.put("/api/vehicles/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { brand, model, year, price, description, images, ...specs } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Actualizar vehículo
    const result = await client.query(
      `UPDATE vehicles SET 
       brand = $1, model = $2, year = $3, price = $4, description = $5,
       motor = $6, potencia = $7, torque = $8, combustible = $9, transmision = $10,
       traccion = $11, consumo_urbano = $12, consumo_ruta = $13, consumo_mixto = $14,
       largo = $15, ancho = $16, alto = $17, peso = $18, cilindrada = $19, aceleracion = $20,
       velocidad_maxima = $21, tanque = $22, maletero = $23, equipamiento = $24, seguridad = $25
       WHERE id = $26 
       RETURNING *`,
      [
        brand,
        model,
        year,
        price,
        description,
        specs.motor,
        specs.potencia,
        specs.torque,
        specs.combustible,
        specs.transmision,
        specs.traccion,
        specs.consumo_urbano,
        specs.consumo_ruta,
        specs.consumo_mixto,
        specs.largo,
        specs.ancho,
        specs.alto,
        specs.peso,
        specs.cilindrada,
        specs.aceleracion,
        specs.velocidad_maxima,
        specs.tanque,
        specs.maletero,
        JSON.stringify(specs.equipamiento || []),
        JSON.stringify(specs.seguridad || []),
        id,
      ]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // Actualizar imágenes si se proporcionan
    if (images && images.length > 0) {
      // Eliminar imágenes antiguas
      await client.query("DELETE FROM vehicle_images WHERE vehicle_id = $1", [
        id,
      ]);

      // Agregar nuevas imágenes
      const imageArray = Array.isArray(images) ? images : [images];
      for (let i = 0; i < imageArray.length; i++) {
        await client.query(
          `INSERT INTO vehicle_images (vehicle_id, image_path, is_cover, position)
           VALUES ($1, $2, $3, $4)`,
          [id, imageArray[i], i === 0, i]
        );
      }
    }

    await client.query("COMMIT");

    // Obtener vehículo actualizado con imágenes
    const vehicleWithImages = await pool.query(
      `SELECT v.*, 
              json_agg(json_build_object('id', vi.id, 'image_path', vi.image_path, 'is_cover', vi.is_cover, 'position', vi.position)) as images
       FROM vehicles v
       LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
       WHERE v.id = $1
       GROUP BY v.id`,
      [id]
    );

    res.json({
      success: true,
      message: "Vehículo actualizado exitosamente",
      data: vehicleWithImages.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar vehículo:", err);
    res.status(500).json({ error: "Error al actualizar vehículo" });
  } finally {
    client.release();
  }
});

// DELETE /api/vehicles/:id - Eliminar vehículo (Protegido)
app.delete("/api/vehicles/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM vehicles WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({
      success: true,
      message: "Vehículo eliminado exitosamente",
    });
  } catch (err) {
    console.error("Error al eliminar vehículo:", err);
    res.status(500).json({ error: "Error al eliminar vehículo" });
  }
});

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "Server running", timestamp: new Date() });
});

// Servir el frontend para cualquier otra ruta (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Iniciar servidor con inicialización automática de BD
const startServer = async () => {
  // Inicializar base de datos
  const dbInitialized = await initializeDatabase();

  if (!dbInitialized) {
    console.error("❌ No se pudo inicializar la base de datos");
    process.exit(1);
  }

  // Iniciar servidor
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📊 Base de datos: ${process.env.DB_NAME || "catalogo_autos"}`);
    console.log(`🌐 CORS habilitado para desarrollo`);
  });
};

startServer();

// Manejo de errores no capturados
process.on("unhandledRejection", (err) => {
  console.error("Error no manejado:", err);
});
