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
const { parsearTextoIngreso } = require("./utils/parser");
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
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET
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

// ==================== HELPER DE VALIDACIÓN ====================
const validarSpecs = (category, specs) => {
  // Ahora permitimos specs vacíos o incompletos
  if (!specs || typeof specs !== 'object') return { valid: true }; // Consideramos válido incluso si es null
  return { valid: true };
};

// ==================== RUTAS DE PUBLICACIONES (Ex Vehículos) ====================

// GET /api/publications - Obtener todas las publicaciones
app.get("/api/publications", async (req, res) => {
  const { category } = req.query; // Filtro opcional
  try {
    let queryText = `
      SELECT p.*, 
             json_agg(json_build_object('id', pi.id, 'image_path', pi.image_path, 'is_cover', pi.is_cover, 'position', pi.position)) as images
      FROM publications p
      LEFT JOIN publication_images pi ON p.id = pi.publication_id
    `;
    
    const queryParams = [];
    if (category) {
      queryText += ` WHERE p.category = $1`;
      queryParams.push(category);
    }

    queryText += ` GROUP BY p.id ORDER BY p.id ASC`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener publicaciones:", err);
    res.status(500).json({ error: "Error al obtener publicaciones" });
  }
});

// GET /api/publications/:id - Obtener una publicación ID
app.get("/api/publications/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, 
              json_agg(json_build_object('id', pi.id, 'image_path', pi.image_path, 'is_cover', pi.is_cover, 'position', pi.position)) as images
       FROM publications p
       LEFT JOIN publication_images pi ON p.id = pi.publication_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener publicación:", err);
    res.status(500).json({ error: "Error al obtener publicación" });
  }
});

// POST /api/contact - Guardar un mensaje
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

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

// POST /api/bot/parse - Parsear texto del bot
app.post("/api/bot/parse", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Texto requerido" });
  
  const parsedData = parsearTextoIngreso(text);
  res.json({ success: true, data: parsedData });
});


// ==================== RUTAS CRUD PROTEGIDAS ====================

// POST /api/upload
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

// POST /api/publications - Crear nueva publicación
app.post("/api/publications", authMiddleware, async (req, res) => {
  // specs es un JSON con los detalles (km, año, horas, etc)
  const { title, price, currency, description, category, images, specs } = req.body;

  // Solo categoría es estrictamente necesaria para la lógica interna, el resto puede ser vacío
  if (!category) {
    return res.status(400).json({ error: "Categoría es requerida" });
  }

  // Precios y títulos por defecto si no vienen
  const finalPrice = price || 0;
  const finalTitle = title || "Sin Título";

  // Validar specs según categoría (ya no estricto)
  const validation = validarSpecs(category, specs);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insertar Publicación
    const pubResult = await client.query(
      `INSERT INTO publications 
       (title, price, currency, description, category, specs) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [finalTitle, finalPrice, currency || 'USD', description || '', category, JSON.stringify(specs || {})]
    );

    const publicationId = pubResult.rows[0].id;

    // Insertar Imágenes
    if (images && images.length > 0) {
      const imageArray = Array.isArray(images) ? images : [images];
      for (let i = 0; i < imageArray.length; i++) {
        await client.query(
          `INSERT INTO publication_images (publication_id, image_path, is_cover, position)
           VALUES ($1, $2, $3, $4)`,
          [publicationId, imageArray[i], i === 0, i]
        );
      }
    }

    await client.query("COMMIT");

    // Obtener resultado completo
    const fullPub = await pool.query(
      `SELECT p.*, 
              json_agg(json_build_object('id', pi.id, 'image_path', pi.image_path, 'is_cover', pi.is_cover, 'position', pi.position)) as images
       FROM publications p
       LEFT JOIN publication_images pi ON p.id = pi.publication_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [publicationId]
    );

    res.status(201).json({
      success: true,
      message: "Publicación creada exitosamente",
      data: fullPub.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al crear publicación:", err);
    res.status(500).json({ error: "Error al crear publicación" });
  } finally {
    client.release();
  }
});

// PUT /api/publications/:id - Actualizar
app.put("/api/publications/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, price, currency, description, category, images, specs } = req.body;

  if (category && specs) {
     const validation = validarSpecs(category, specs);
     if (!validation.valid) return res.status(400).json({ error: validation.error });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Actualizar datos básicos
    const result = await client.query(
      `UPDATE publications SET 
       title = COALESCE($1, title), 
       price = COALESCE($2, price), 
       currency = COALESCE($3, currency),
       description = COALESCE($4, description),
       category = COALESCE($5, category),
       specs = COALESCE($6, specs),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [title, price, currency, description, category, specs ? JSON.stringify(specs) : null, id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    // Actualizar imágenes (Reemplazo completo si se envían nuevas)
    if (images && images.length > 0) {
      await client.query("DELETE FROM publication_images WHERE publication_id = $1", [id]);

      const imageArray = Array.isArray(images) ? images : [images];
      for (let i = 0; i < imageArray.length; i++) {
        await client.query(
          `INSERT INTO publication_images (publication_id, image_path, is_cover, position)
           VALUES ($1, $2, $3, $4)`,
          [id, imageArray[i], i === 0, i]
        );
      }
    }

    await client.query("COMMIT");

    const fullPub = await pool.query(
      `SELECT p.*, 
              json_agg(json_build_object('id', pi.id, 'image_path', pi.image_path, 'is_cover', pi.is_cover, 'position', pi.position)) as images
       FROM publications p
       LEFT JOIN publication_images pi ON p.id = pi.publication_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    res.json({
      success: true,
      message: "Publicación actualizada exitosamente",
      data: fullPub.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar publicación:", err);
    res.status(500).json({ error: "Error al actualizar publicación" });
  } finally {
    client.release();
  }
});

// DELETE /api/publications/:id
app.delete("/api/publications/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM publications WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json({
      success: true,
      message: "Publicación eliminada exitosamente",
    });
  } catch (err) {
    console.error("Error al eliminar publicación:", err);
    res.status(500).json({ error: "Error al eliminar publicación" });
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
  const dbInitialized = await initializeDatabase();

  if (!dbInitialized) {
    console.error("❌ No se pudo inicializar la base de datos");
    process.exit(1);
  }

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

