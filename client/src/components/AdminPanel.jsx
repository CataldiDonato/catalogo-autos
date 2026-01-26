import { useState, useEffect } from "react";
import API_ENDPOINTS from "../config";

export default function AdminPanel() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    brand: "",
    minPrice: "",
    maxPrice: "",
    year: "",
    search: "",
    category: "",
  });

  const [formData, setFormData] = useState({
    title: "", // Título genérico si se necesita, o se arma desde brand/model
    category: "VEHICULO", // Default category
    price: "",
    images: [],
    imagePreviews: [],
    description: "",

    // CAMPOS ESPECÍFICOS (Se mapean a specs)
    // VEHICULO
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    km: "",
    transmision: "",
    combustible: "",
    motor: "",
    potencia: "",

    // MAQUINARIA
    horas: "",
    // Usamos 'potencia' y 'year' compartidos o específicos si se prefiere

    // HERRAMIENTA
    condicion: "Nuevo", // Nuevo/Usado
    marca: "",

    // Generales extras
    equipamiento: "",
    seguridad: "",
  });

  // Cargar token y vehículos al montar
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setError("No estás autenticado. Por favor inicia sesión.");
      return;
    }
    setToken(savedToken);
    fetchVehicles(savedToken);
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [vehicles, filters]);

  const applyFilters = () => {
    let filtered = vehicles;

    // Filtro por búsqueda (marca, modelo, titulo)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          (v.title && v.title.toLowerCase().includes(searchLower)) ||
          (v.specs && v.specs.brand && v.specs.brand.toLowerCase().includes(searchLower)) ||
          (v.specs && v.specs.model && v.specs.model.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por marca (desde specs)
    if (filters.brand) {
      filtered = filtered.filter((v) => v.specs && v.specs.brand === filters.brand);
    }

    // Filtro por categoría
    if (filters.category) {
      filtered = filtered.filter((v) => v.category === filters.category);
    }

    // Filtro por año (desde specs)
    if (filters.year) {
      filtered = filtered.filter((v) => v.specs && v.specs.year === parseInt(filters.year));
    }

    // Filtro por rango de precio
    if (filters.minPrice) {
      filtered = filtered.filter(
        (v) => Number(v.price) >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (v) => Number(v.price) <= parseFloat(filters.maxPrice)
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      brand: "",
      minPrice: "",
      maxPrice: "",
      year: "",
      search: "",
      category: "",
    });
  };

  const fetchVehicles = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.PUBLICATIONS);
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError("Error al cargar publicaciones");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Crear previsualizaciones
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: files,
      imagePreviews: previews,
    }));
  };

  const removeImagePreview = (index) => {
    setFormData((prev) => ({
      ...prev,
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (sourceIndex === targetIndex) return;

    setFormData((prev) => {
      const newPreviews = [...prev.imagePreviews];
      const newImages = [...prev.images];

      // Reorder previews
      const [movedPreview] = newPreviews.splice(sourceIndex, 1);
      newPreviews.splice(targetIndex, 0, movedPreview);

      // Reorder actual files if they map 1:1, but careful: 
      // Logic: 'images' array only holds NEW files. 'imagePreviews' holds mixed (existing & new).
      // If we are just reordering previews, that's what matters for display.
      // BUT, for submission, we need to know the final order.
      // 'handleSubmit' rebuilds the list based on previews? 
      // Current logic in handleSubmit relies on 'imagePreviews' to determine existing vs new?
      // Let's check handleSubmit logic again.
      // It says: "imagePaths = await uploadImages()" for new ones.
      // "if (editingId && formData.imagePreviews.length === 0)" -> this assumes we replace all if new ones added?
      // Wait, the current edit logic (lines 405-416 in put) REPLACES ALL images if 'images' array is sent.
      // So we need to make sure we send the FULL list of desired images in correct order.
      // For mixed content (existing URLs + new Files), 'uploadImages' only handles new Files.
      // We probably need to refactor how we submit images to support mixed reordering.
      // Actually, 'imagePreviews' contains { file, preview, isCover }.
      // If 'file' is null, it's an existing image. If 'file' is object, it's new.

      // We should reorder 'images' array too if it exists, but it's tricky because indices might not match if mixed.
      // SIMPLIFICATION: We will only support reordering of the 'imagePreviews' list effectively.
      // And we need to make sure handleSubmit uses 'imagePreviews' order to construct the final payload.

      // However, 'uploadImages' iterates over 'formData.images'. 
      // If we mix order, we need to map the uploaded files back to their correct slot in the final array.
      // This is complex. 

      // SIMPLEST APPROACH for now:
      // Just reorder 'imagePreviews'.
      // We also try to reorder 'images' (File objects) but it only works if ALL are new files.
      // If we have mixed, we might desync 'images' array.

      // Let's look at updating 'images' array carefully. 
      // 'imagePreviews' has 1:1 with 'images' ONLY if all are new? 
      // No, 'images' only stores the File objects. 'imagePreviews' stores everything.
      // Actually line 169: images: files. (Replace all?) No, handleImageChange appends?
      // Line 169: images: files (from e.target.files). It replaces simple state if used directly?
      // line 167: setFormData(prev => ... images: files ... ).
      // It seems 'images' state strictly holds the FileList from input? 
      // Wait, handleImageChange (line 158) converts to Array.from(e.target.files).
      // It REPLACES 'images' and 'imagePreviews' currently? 
      // Line 167: 'images: files' replaces previous files?
      // If so, we only support adding a batch at once, not appending?
      // If it replaces, then 1:1 mapping exists between images and imagePreviews IF we are adding new.
      // If editing, 'images' is empty initially.

      // Hack: We mainly care about visual order in 'imagePreviews'.
      // We also need to keep 'images' (the List of Files) in sync if we want 'uploadImages' to work generally?
      // Actually 'uploadImages' just uploads whatever is in 'formData.images'. 
      // The ORDER of upload doesn't matter for file storage.
      // What matters is the ORDER of paths we send to backend.
      // So we need to reconstruct the list of paths in the correct order in 'handleSubmit'.

      return {
        ...prev,
        imagePreviews: newPreviews,
        // We don't necessarily update 'images' (Files) order because we track them via previews for submission logic?
        // We need to fix handleSubmit to respect 'imagePreviews' order.
      };
    });
  };

  const uploadImages = async () => {
    if (formData.images.length === 0) {
      setError("Selecciona al menos una imagen");
      return;
    }

    setUploadingImages(true);
    const formDataToSend = new FormData();

    formData.images.forEach((file) => {
      formDataToSend.append("images", file);
    });

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al cargar imágenes");
        setUploadingImages(false);
        return;
      }

      // Retornar las rutas de las imágenes subidas
      setUploadingImages(false);
      return data.files.map((f) => f.path);
    } catch (err) {
      setError("Error de conexión al subir imágenes");
      setUploadingImages(false);
      console.error(err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("No tienes autorización");
      return;
    }

    try {
      // Subir imágenes primero
      // Subir imágenes nuevas primero
      let uploadedPaths = [];
      if (formData.images.length > 0) {
        uploadedPaths = await uploadImages();
        if (!uploadedPaths) return;
      }

      // Construir array final de rutas en orden CORRECTO, mapeando previews
      // Estrategia: Iterar sobre imagePreviews. 
      // Si tiene 'file', buscamos su path en uploadedPaths (o asumimos orden si mapeo complejo, idealmente por nombre).
      // PERO, uploadImages devuelve lista simple.
      // simplificación: Asumimos que 'formData.images' (Files) se subieron y están en 'uploadedPaths'.
      // Necesitamos asocia cada File subido con su preview original para saber donde va.
      // Esto es complejo porque 'uploadedPaths' pierde referencia al objeto File original.

      // SOLUCIÓN MEJORADA:
      // Cuando subimos, mapeamos por nombre de archivo o índice?
      // Mejor aún: Iteramos 'imagePreviews'.
      // Si tiene 'file' -> Tomamos el siguiente de 'uploadedPaths' (Queue).
      // Si NO tiene 'file' -> Es URL existente, la usamos directo.

      // NOTA: Esto asume que 'formData.images' se subió en el mismo orden que 'upload' procesó.
      // Y que 'formData.images' contiene TODOS los archivos nuevos presentes en 'imagePreviews'.
      // Como 'removeImagePreview' elimina de 'formData.images' también, deberíamos estar sincronizados.
      // PERO reordenar previews NO reordena 'formData.images'.
      // Así que 'uploadImages' subirá en orden original de adición.
      // Necesitamos matchear.

      // Vamos a confiar en el nombre del archivo si es posible, o hacer el match manual.
      // 'uploadedPaths' son strings tipo '/uploads/nombre-timestamp.jpg'.
      // No tenemos el nombre original fácil ahí si se cambió.

      // FIX RÁPIDO: Reconstruir 'formData.images' al hacer Drop es difícil.
      // Vamos a hacer lo siguiente:
      // 1. Subir todo lo que haya en 'formData.images'.
      // 2. Crear un mapa temporal: originalName -> uploadedPath.
      // 3. Recorrer 'imagePreviews'.
      //    - Si es existente (sin file), push path.
      //    - Si es nuevo (con file), buscar path en el mapa por nombre de archivo.

      // Hack para mapear uploaded files a sus originales:
      // uploadImages devuelve paths. El server preserva nombre original + sufijo.
      // Podríamos intentar matchear. 
      // O simplemente, modificar 'uploadImages' para devolver objeto { originalName, path }.
      // Pero no quiero tocar server si no es necesario.

      // Alternativa: 'formData.images' NO se reordena. 'uploadedPaths' corresponde a ese orden.
      // Creamos un mapa: File object -> Uploaded Path.
      // ¿Cómo? 'formData.images[i]' corresponde a 'uploadedPaths[i]'.

      let fileToPathMap = new Map();
      if (formData.images.length > 0 && uploadedPaths.length > 0) {
        formData.images.forEach((file, idx) => {
          if (uploadedPaths[idx]) {
            fileToPathMap.set(file, uploadedPaths[idx]);
          }
        });
      }

      const finalImagePaths = formData.imagePreviews.map(preview => {
        if (preview.file) {
          // Es nuevo, buscar en mapa
          return fileToPathMap.get(preview.file);
        }
        return preview.preview; // Es existente (URL)
      }).filter(p => p); // Filtrar nulos si falla algo


      // PREPARAR EL PAYLOAD (Empaquetar specs según categoría)
      const specs = {};
      let title = formData.title;

      if (formData.category === 'VEHICULO') {
        specs.brand = formData.brand;
        specs.model = formData.model;
        specs.year = parseInt(formData.year);
        specs.km = parseInt(formData.km);
        specs.transmision = formData.transmision;
        specs.combustible = formData.combustible;
        specs.motor = formData.motor;
        specs.potencia = formData.potencia;
        // Construir título si está vacío
        if (!title) title = `${specs.brand} ${specs.model} ${specs.year}`;
      } else if (formData.category === 'MAQUINARIA') {
        specs.brand = formData.brand; // Usamos campo 'brand' para 'marca' genérica si queremos
        specs.model = formData.model;
        specs.year = parseInt(formData.year);
        specs.horas = parseInt(formData.horas);
        specs.potencia = parseInt(formData.potencia); // Asumimos HP numérico
        // Construir título si está vacío
        if (!title) title = `${specs.brand || 'Maquinaria'} ${specs.model || ''} - ${specs.horas} hs`;
      } else if (formData.category === 'HERRAMIENTA') {
        specs.condicion = formData.condicion;
        specs.marca = formData.marca;
        // Construir título si está vacío
        if (!title && formData.marca) title = `${formData.marca} - ${formData.condicion}`;
        else if (!title) title = "Herramienta";
      }

      // Campos comunes extras
      specs.equipamiento = formData.equipamiento
        ? formData.equipamiento.split(",").map((s) => s.trim()).filter((s) => s)
        : [];
      specs.seguridad = formData.seguridad
        ? formData.seguridad.split(",").map((s) => s.trim()).filter((s) => s)
        : [];

      const payload = {
        title: title,
        price: parseFloat(formData.price),
        currency: 'USD',
        description: formData.description,
        category: formData.category,
        images: finalImagePaths,
        specs: specs, // Enviar specs como objeto anidado, ya que el server lo espera así
      };

      const endpoint = editingId
        ? API_ENDPOINTS.PUBLICATION_DETAIL(editingId)
        : API_ENDPOINTS.PUBLICATIONS;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error en la operación");
        return;
      }

      setSuccess(data.message);
      resetForm();
      fetchVehicles(token);
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta publicación?"))
      return;

    try {
      const response = await fetch(API_ENDPOINTS.PUBLICATION_DETAIL(id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al eliminar");
        return;
      }

      setSuccess("Publicación eliminada exitosamente");
      fetchVehicles(token);
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    }
  };

  const handleEdit = (pub) => {
    // Desempaquetar specs al form data flat
    const specs = pub.specs || {};

    setFormData({
      title: pub.title || "",
      category: pub.category,
      price: pub.price,
      images: [],
      imagePreviews: pub.images
        ? pub.images
          .sort((a, b) => a.position - b.position)
          .map((img) => ({
            file: null,
            preview: img.image_path,
            isCover: img.is_cover,
          }))
        : [],
      description: pub.description,

      // Mapeo inverso de specs
      brand: specs.brand || specs.marca || "",
      model: specs.model || "",
      year: specs.year || "",
      km: specs.km || "",
      transmision: specs.transmision || "",
      combustible: specs.combustible || "",
      motor: specs.motor || "",
      potencia: specs.potencia || "",
      horas: specs.horas || "",
      condicion: specs.condicion || "Nuevo",
      marca: specs.brand || specs.marca || "", // Redundancia para herramienta

      equipamiento: Array.isArray(specs.equipamiento)
        ? specs.equipamiento.join(", ")
        : "",
      seguridad: Array.isArray(specs.seguridad)
        ? specs.seguridad.join(", ")
        : "",
    });
    setEditingId(pub.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "VEHICULO",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      images: [],
      imagePreviews: [],
      description: "",
      km: "",
      motor: "",
      potencia: "",
      combustible: "",
      transmision: "",
      horas: "",
      condicion: "Nuevo",
      marca: "",
      equipamiento: "",
      seguridad: "",
    });
    setEditingId(null);
    setShowModal(false);
    setError("");
    setSuccess("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-xl text-red-600 mb-4">
            No tienes acceso a esta sección
          </p>
          <a
            href="/auth"
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Nueva Publicación
        </button>

        {/* MODAL FLOTANTE */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8">
              <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center rounded-t-lg z-10">
                <h2 className="text-2xl font-bold">
                  {editingId ? "Editar Publicación" : "Nueva Publicación"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-2xl hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* SELECTOR CATEGORÍA */}
                <div className="mb-4">
                  <label className="block font-bold mb-2 text-lg text-blue-700">Tipo de Publicación</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg text-lg focus:border-blue-500 outline-none"
                  >
                    <option value="VEHICULO">Vehículo</option>
                    <option value="MAQUINARIA">Maquinaria Agrícola</option>
                    <option value="HERRAMIENTA">Herramienta</option>
                  </select>
                </div>

                <hr className="my-4" />

                {/* CAMPOS DINÁMICOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Título y Precio (Comunes) */}
                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">Título (Opcional - se genera automático)</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Ej: Toyota Hilux 2021..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Precio (USD)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  {/* --- VEHÍCULO --- */}
                  {formData.category === 'VEHICULO' && (
                    <>
                      <div>
                        <label className="block font-bold mb-2">Marca</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Modelo</label>
                        <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Año</label>
                        <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Kilómetros</label>
                        <input type="number" name="km" value={formData.km} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Transmisión</label>
                        <select name="transmision" value={formData.transmision} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                          <option value="">Seleccionar...</option>
                          <option value="Manual">Manual</option>
                          <option value="Automática">Automática</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Combustible</label>
                        <select name="combustible" value={formData.combustible} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                          <option value="">Seleccionar...</option>
                          <option value="Nafta">Nafta</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* --- MAQUINARIA --- */}
                  {formData.category === 'MAQUINARIA' && (
                    <>
                      <div>
                        <label className="block font-bold mb-2">Marca</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Modelo</label>
                        <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Año</label>
                        <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Horas de Uso</label>
                        <input type="number" name="horas" value={formData.horas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Ej: 5000" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Potencia (HP)</label>
                        <input type="number" name="potencia" value={formData.potencia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Ej: 180" />
                      </div>
                    </>
                  )}

                  {/* --- HERRAMIENTA --- */}
                  {formData.category === 'HERRAMIENTA' && (
                    <>
                      <div>
                        <label className="block font-bold mb-2">Marca / Fabricante</label>
                        <input type="text" name="marca" value={formData.marca} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Condición</label>
                        <select name="condicion" value={formData.condicion} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                          <option value="Nuevo">Nuevo</option>
                          <option value="Usado">Usado</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">
                      🖼️ Imágenes
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  {formData.imagePreviews.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative group cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                          >
                            <img
                              src={preview.preview}
                              alt={`Preview ${index + 1}`}
                              className={`w-full h-24 object-cover rounded ${index === 0 ? "border-4 border-blue-600" : ""
                                }`}
                            />
                            {index === 0 && (
                              <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Portada
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImagePreview(index)}
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition"
                            >
                              <span className="text-white text-2xl">✕</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">Descripción</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    ></textarea>
                  </div>

                  {/* Extras solo para Vehiculo/Maquinaria opcionalmente */}
                  {(formData.category === 'VEHICULO' || formData.category === 'MAQUINARIA') && (
                    <div className="md:col-span-2">
                      <label className="block font-bold mb-2">
                        Equipamiento / Extras (separado por comas)
                      </label>
                      <textarea
                        name="equipamiento"
                        value={formData.equipamiento}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Ej: Radio, GPS, Aire acondicionado"
                      ></textarea>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-end pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImages}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded"
                  >
                    {uploadingImages ? "Subiendo..." : editingId ? "Actualizar" : "Crear"}{" "}
                    Publicación
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-bold mb-4">🔍 Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block font-bold mb-2">Categoría</label>
              <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">Todas</option>
                <option value="VEHICULO">Vehículos</option>
                <option value="MAQUINARIA">Maquinaria</option>
                <option value="HERRAMIENTA">Herramientas</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">Buscar</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Nombre, marca..."
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            {/* ... Resto de filtros simplificados ... */}
            <div>
              <label className="block font-bold mb-2">Precio Máx</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <button onClick={resetFilters} className="mt-4 bg-gray-400 text-white px-4 py-2 rounded">Limpiar</button>
        </div>

        {/* TABLA DE RESULTADOS */}
        {/* VISTA ESCRITORIO (Tabla) */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          {/* ... Renderizar lista de forma simplificada por ahora ... */}
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Foto
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Título / Info
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex-shrink-0 w-16 h-16">
                      <img
                        className="w-full h-full rounded-md object-cover"
                        src={
                          (vehicle.images && vehicle.images.length > 0
                            ? (vehicle.images.find(i => i.is_cover)?.image_path || vehicle.images[0].image_path)
                            : vehicle.image_url) || "https://via.placeholder.com/150"
                        }
                        alt=""
                      />
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 font-bold whitespace-no-wrap">
                      {vehicle.title || `${vehicle.specs?.brand || ''} ${vehicle.specs?.model || ''}`}
                    </p>
                    <p className="text-gray-600 text-xs">{vehicle.specs?.year || ''}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                      ></span>
                      <span className="relative">{vehicle.category}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      USD {vehicle.price}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVehicles.length === 0 && (
            <div className="p-4 text-center text-gray-500">No se encontraron publicaciones.</div>
          )}
        </div>

        {/* VISTA MÓVIL (Tarjetas) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-3">
              {/* Imagen y Titulo */}
              <div className="flex gap-4">
                <img
                  className="w-20 h-20 rounded-md object-cover"
                  src={
                    (vehicle.images && vehicle.images.length > 0
                      ? (vehicle.images.find(i => i.is_cover)?.image_path || vehicle.images[0].image_path)
                      : vehicle.image_url) || "https://via.placeholder.com/150"
                  }
                  alt=""
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">
                      {vehicle.title || `${vehicle.specs?.brand || ''} ${vehicle.specs?.model || ''}`}
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                      {vehicle.specs?.year || ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{vehicle.category}</p>
                  <p className="font-bold text-green-700 text-lg mt-1">USD {vehicle.price}</p>
                </div>
              </div>

              {/* Botones de acción grandes */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1 bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded hover:bg-blue-200 transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="flex-1 bg-red-100 text-red-700 font-bold py-2 px-4 rounded hover:bg-red-200 transition"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
          {filteredVehicles.length === 0 && (
            <div className="p-4 text-center text-gray-500 bg-white rounded shadow">No se encontraron publicaciones.</div>
          )}
        </div>
      </div>
    </div>
  );
}
