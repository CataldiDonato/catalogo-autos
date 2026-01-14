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
      let imagePaths = [];
      if (formData.imagePreviews.length > 0 && formData.images.length > 0) {
        imagePaths = await uploadImages();
        if (!imagePaths) {
          return;
        }
      } else if (editingId && formData.imagePreviews.length === 0) {
        // Si estamos editando y no hay nuevas imágenes, usar las existentes
        const existingVehicle = vehicles.find((v) => v.id === editingId);
        if (existingVehicle && existingVehicle.images) {
          imagePaths = existingVehicle.images.map((img) => img.image_path);
        }
        if (existingVehicle && existingVehicle.images) {
          imagePaths = existingVehicle.images.map((img) => img.image_path);
        }
      } 
      // Si no hay imágenes, simplemente seguimos sin ellas


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
        images: imagePaths,
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
                
                <hr className="my-4"/>

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
                        <input type="number" name="potencia" value={formData.potencia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Ej: 180"/>
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
                          <div key={index} className="relative group">
                            <img
                              src={preview.preview}
                              alt={`Preview ${index + 1}`}
                              className={`w-full h-24 object-cover rounded ${
                                index === 0 ? "border-4 border-blue-600" : ""
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                          (vehicle.images && vehicle.images.length>0 
                            ? (vehicle.images.find(i=>i.is_cover)?.image_path || vehicle.images[0].image_path) 
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
      </div>
    </div>
  );
}
