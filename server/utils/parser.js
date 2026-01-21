/**
 * Parsea el texto de ingreso del usuario y devuelve una estructura JSON limpia.
 * Separa datos numéricos para filtros y texto para descripción.
 * 
 * @param {string} textoUsuario - Texto crudo ingresado por el usuario (o bot).
 * @returns {object} - Objeto estructurado para crear una publicación.
 */
function parsearTextoIngreso(textoUsuario) {
  if (!textoUsuario) return {};

  const lines = textoUsuario.split('\n').map(l => l.trim()).filter(Boolean);
  const specs = {};
  let description = '';
  let title = '';
  let price = 0;
  let currency = 'USD';
  let category = 'VEHICULO'; // Default, puede ser inferido

  // Regex helpers
  const priceRegex = /(\$|USD|U\$S)\s?([\d.,]+)/i;
  const yearRegex = /\b(19|20)\d{2}\b/;
  const kmRegex = /([\d.,]+)\s?(km|kms|mil km)/i;
  const hoursRegex = /([\d.,]+)\s?(hs|horas)/i;

  // Lógica básica de parsing (Heurística)
  // Asumimos primera línea es título si es corta, sino es descripción
  if (lines.length > 0) {
    title = lines[0];
    // Intentar detectar precio en el título o removerlo
    const priceMatch = title.match(priceRegex);
    if (priceMatch) {
      // Extraer y limpiar
    }
  }

  // Iterar líneas para extraer datos
  const remainingLines = [];
  lines.forEach((line, index) => {
    let handled = false;

    // Detectar Precio
    const priceMatch = line.match(priceRegex);
    if (priceMatch && !price) {
      let valStr = priceMatch[2].replace(/[.,]/g, ''); // Simplificado, cuidado con decimales
      price = parseFloat(valStr);
      // Ajustar si el usuario usó puntos para miles (ej 10.000 -> 10000)
      // Si el valor es muy bajo, tal vez era decimal. Pero autos suelen ser > 1000
      handled = true;
    }

    // Detectar Año
    const yearMatch = line.match(yearRegex);
    if (yearMatch) {
      specs.anio = parseInt(yearMatch[0]);
      // No marcamos handled porque puede ser parte del título descriptivo
    }

    // Detectar KM (Vehículo)
    const kmMatch = line.match(kmRegex);
    if (kmMatch) {
      let valStr = kmMatch[1].replace(/[.,]/g, '');
      specs.km = parseInt(valStr);
    }

    // Detectar Horas (Maquinaria)
    const hoursMatch = line.match(hoursRegex);
    if (hoursMatch) {
      let valStr = hoursMatch[1].replace(/[.,]/g, '');
      specs.horas = parseInt(valStr);
      category = 'MAQUINARIA'; // Inferencia simple
    }

    // Detectar Herramientas (Nuevo/Usado) o Keywords
    if (line.match(/nuevo/i)) specs.condicion = 'Nuevo';
    if (line.match(/usado/i)) specs.condicion = 'Usado';
    
    // Keywords fuertes para Maquinaria
    if (line.match(/(tractor|cosechadora|sembradora|pulverizadora|fumigador)/i)) {
       category = 'MAQUINARIA';
    }

    // Keywords fuertes para Herramientas
    if (line.match(/(tolva|tanque|acoplado|plataforma|cabezal|monitor|banderillero|balanza|moledora|mixer)/i)) {
       category = 'HERRAMIENTA';
    }

    if (!handled && index > 0) {
      remainingLines.push(line);
    }
  });

  description = remainingLines.join('\n');

  // Retornar estructura base
  return {
    title,
    price,
    currency,
    category, 
    description,
    specs
  };
}

module.exports = { parsearTextoIngreso };
