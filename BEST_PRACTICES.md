# 🎯 Guía de Buenas Prácticas del Proyecto

## 📐 Estructura y Organización

### Importar desde módulos centralizados

❌ **Evitar:**

```javascript
const formattedPrice = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
}).format(price);
```

✅ **Hacer:**

```javascript
import { formatPrice } from "../utils/formatters";
const formattedPrice = formatPrice(price);
```

### Gestionar autenticación

❌ **Evitar:**

```javascript
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
```

✅ **Hacer:**

```javascript
import { useAuth } from "../hooks/useAuth";

const { user, token, isAuthenticated, logout } = useAuth();
```

## 🎨 Estilos y Responsive Design

### Mobile-First

- Siempre comenzar con estilos base (móvil)
- Usar `sm:`, `md:`, `lg:` para expandir en dispositivos más grandes
- Probar con `min-width` en media queries

### Accesibilidad

- Hit areas mínimas de 44x44px para botones/enlaces
- Focus states visibles (`:focus`, `focus:ring`)
- Usar `aria-hidden="true"` para decoraciones

### Clases CSS Comunes

```jsx
// Botón estándar
className =
  "bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition duration-300 min-h-[44px]";

// Contenedor responsivo
className = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

// Grid responsivo
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
```

## 📦 Dependencias y Imports

### Orden de importaciones

1. React/librerías externas
2. Componentes locales
3. Utilidades
4. Constantes

```javascript
import { useState } from "react";
import { Link } from "react-router-dom";

import Navigation from "../components/Navigation";
import { formatPrice } from "../utils/formatters";
import { WHATSAPP_CONFIG } from "../constants/whatsapp";
```

## 🔄 API y Datos

### Usar módulo centralizado

```javascript
import { fetchVehicles, createVehicle } from "../utils/api";

const vehicles = await fetchVehicles();
const newVehicle = await createVehicle(data);
```

### Error Handling

```javascript
try {
  const data = await fetchVehicles();
  setVehicles(data);
} catch (err) {
  console.error("Error:", err);
  setError("Mensaje de error amigable");
}
```

## 🧹 Mantener Limpio

### Remover

- ❌ Código comentado
- ❌ Variables sin usar
- ❌ Imports no utilizados
- ❌ Funciones duplicadas

### Documentar

- ✅ Comentarios en funciones complejas
- ✅ JSDoc para componentes y hooks
- ✅ README en carpetas especializadas

## 🧪 Testing (Futuro)

### Nombrar tests

```javascript
// ✅ Descriptivo
test("formatPrice convierte número a moneda USD", () => {});

// ❌ Vago
test("format works", () => {});
```

## 📝 Commits

### Usar mensajes claros

```
✨ feat: Agregar formatPrice a utils
🐛 fix: Corregir alineación de navegación en móvil
♻️ refactor: Extraer WhatsApp config a constantes
🧹 chore: Limpiar imports no utilizados
```

---

**Última actualización**: 9 de enero de 2026
