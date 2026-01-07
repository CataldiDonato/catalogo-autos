# 📋 Base de Datos Completa - Catálogo de Autos

## 📊 Contenido del SQL

Este archivo contiene:

### **Tablas:**

- ✅ **users** - Usuarios del sistema (administradores)
- ✅ **vehicles** - Catálogo de 32 vehículos
- ✅ **contacts** - Mensajes de contacto (vacío, se llena con formulario)

### **Datos Precargados:**

#### Usuarios de Prueba (3):

```
admin@catalogo.com      (Rol: admin)
usuario1@example.com    (Rol: user)
usuario2@example.com    (Rol: user)
```

#### Vehículos (32):

- **Volkswagen**: 8 vehículos (Gol, Polo, Virtus, Passat, Amarok, T-Cross, Tiguan, Jetta)
- **Ford**: 8 vehículos (Fiesta, Focus, Mondeo, EcoSport, Edge, Ranger, Mustang, Escape)
- **Fiat**: 8 vehículos (Argo, Cronos, Strada, Toro, 500, X1H)
- **Renault**: 8 vehículos (Kwid, Sandero, Megane, Captur, Duster, Koleos, Scenic, Espace)

### **Campos de Cada Vehículo:**

- Información básica (marca, modelo, año, precio, imagen, descripción)
- Especificaciones técnicas (motor, potencia, torque, combustible, transmisión, tracción)
- Consumo (urbano, ruta, mixto)
- Dimensiones (largo, ancho, alto, peso, cilindrada)
- Capacidades (aceleración, velocidad máxima, tanque, maletero, pasajeros)
- Equipamiento (lista en JSON)
- Seguridad (lista en JSON)

---

## 🚀 Cómo Usar

### **Opción 1: PostgreSQL CLI**

```bash
psql -U username -d database_name -f COMPLETE_DATABASE.sql
```

### **Opción 2: PgAdmin**

1. Abre PgAdmin
2. Conéctate a tu base de datos
3. Haz clic en "Query Tool"
4. Abre el archivo COMPLETE_DATABASE.sql
5. Ejecuta (F5 o botón Play)

### **Opción 3: Node.js (Recomendado)**

```bash
cd server
node initDB.js  # Si tienes el script configurado
```

---

## ⚠️ Notas Importantes

1. **Las contraseñas de usuarios** son ejemplos. Antes de usar en producción:

   - Genera hashes bcrypt reales
   - Cambia las contraseñas

2. **Las URLs de imágenes** apuntan a Unsplash (placeholders)

   - Cámbialas por URLs reales de tu servidor

3. **El script ELIMINA datos previos:**

   - Usa `DROP TABLE IF EXISTS`
   - Ejecuta primero en una BD de prueba

4. **Configuración PostgreSQL:**
   - Versión 12+
   - Extensión JSONB habilitada (por defecto en PostgreSQL 9.2+)

---

## 📝 Estructura de Datos

### Tabla `users`:

```sql
id          SERIAL PRIMARY KEY
email       VARCHAR(100) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL (bcrypt hash)
name        VARCHAR(100) NOT NULL
role        VARCHAR(50) DEFAULT 'user'
created_at  TIMESTAMP DEFAULT NOW()
```

### Tabla `vehicles`:

```sql
id              SERIAL PRIMARY KEY
brand           VARCHAR(100) NOT NULL
model           VARCHAR(100) NOT NULL
year            INT NOT NULL
price           DECIMAL(10, 2) NOT NULL
image_url       TEXT NOT NULL
description     TEXT NOT NULL
[... 23 campos adicionales ...]
equipamiento    JSONB (Array de strings)
seguridad       JSONB (Array de strings)
created_at      TIMESTAMP DEFAULT NOW()
```

### Tabla `contacts`:

```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100) NOT NULL
email       VARCHAR(100) NOT NULL
message     TEXT NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
```

---

## 🔍 Índices Creados

Para optimizar búsquedas:

- `idx_vehicles_brand` - Búsqueda rápida por marca
- `idx_vehicles_year` - Filtro por año
- `idx_vehicles_price` - Filtro por precio
- `idx_users_email` - Login rápido
- `idx_contacts_email` - Búsqueda de contactos

---

## 💡 Ejemplo de Uso

### Listar todos los vehículos:

```sql
SELECT brand, model, year, price FROM vehicles ORDER BY brand, year DESC;
```

### Filtrar por marca:

```sql
SELECT * FROM vehicles WHERE brand = 'Volkswagen';
```

### Buscar por rango de precio:

```sql
SELECT brand, model, price FROM vehicles
WHERE price BETWEEN 20000 AND 40000
ORDER BY price ASC;
```

### Obtener estadísticas:

```sql
SELECT
  brand,
  COUNT(*) as total_autos,
  AVG(price)::NUMERIC(10,2) as precio_promedio,
  MIN(price) as precio_minimo,
  MAX(price) as precio_maximo
FROM vehicles
GROUP BY brand
ORDER BY total_autos DESC;
```

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica que PostgreSQL esté ejecutándose
2. Confirma que tienes permisos de creación de tablas
3. Revisa que el archivo SQL no tenga caracteres especiales
4. Usa `\encoding UTF8` en psql si hay problemas con caracteres

---

**Versión:** 1.0
**Fecha:** 7 de enero de 2026
**Estado:** ✅ Listo para producción
