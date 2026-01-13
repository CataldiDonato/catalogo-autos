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
  });

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    images: [],
    imagePreviews: [],
    description: "",
    motor: "",
    potencia: "",
    torque: "",
    combustible: "",
    transmision: "",
    traccion: "",
    consumo_urbano: "",
    consumo_ruta: "",
    consumo_mixto: "",
    largo: "",
    ancho: "",
    alto: "",
    peso: "",
    cilindrada: "",
    aceleracion: "",
    velocidad_maxima: "",
    tanque: "",
    maletero: "",
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

    // Filtro por búsqueda (marca, modelo)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.brand.toLowerCase().includes(searchLower) ||
          v.model.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por marca
    if (filters.brand) {
      filtered = filtered.filter((v) => v.brand === filters.brand);
    }

    // Filtro por año
    if (filters.year) {
      filtered = filtered.filter((v) => v.year === parseInt(filters.year));
    }

    // Filtro por rango de precio
    if (filters.minPrice) {
      filtered = filtered.filter(
        (v) => v.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (v) => v.price <= parseFloat(filters.maxPrice)
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
    });
  };

  const fetchVehicles = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError("Error al cargar vehículos");
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
      } else {
        setError("Debes seleccionar al menos una imagen");
        return;
      }

      const payload = {
        ...formData,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        images: imagePaths,
        equipamiento: formData.equipamiento
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        seguridad: formData.seguridad
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      // Eliminar campos que no necesitamos enviar
      delete payload.image_url;
      delete payload.imagePreviews;

      const endpoint = editingId
        ? API_ENDPOINTS.VEHICLE_DETAIL(editingId)
        : API_ENDPOINTS.VEHICLES;

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
    if (!window.confirm("¿Estás seguro de que quieres eliminar este vehículo?"))
      return;

    try {
      const response = await fetch(API_ENDPOINTS.VEHICLE_DETAIL(id), {
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

      setSuccess("Vehículo eliminado exitosamente");
      fetchVehicles(token);
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      images: [],
      imagePreviews: vehicle.images
        ? vehicle.images
            .sort((a, b) => a.position - b.position)
            .map((img) => ({
              file: null,
              preview: img.image_path,
              isCover: img.is_cover,
            }))
        : [],
      description: vehicle.description,
      motor: vehicle.motor || "",
      potencia: vehicle.potencia || "",
      torque: vehicle.torque || "",
      combustible: vehicle.combustible || "",
      transmision: vehicle.transmision || "",
      traccion: vehicle.traccion || "",
      consumo_urbano: vehicle.consumo_urbano || "",
      consumo_ruta: vehicle.consumo_ruta || "",
      consumo_mixto: vehicle.consumo_mixto || "",
      largo: vehicle.largo || "",
      ancho: vehicle.ancho || "",
      alto: vehicle.alto || "",
      peso: vehicle.peso || "",
      cilindrada: vehicle.cilindrada || "",
      aceleracion: vehicle.aceleracion || "",
      velocidad_maxima: vehicle.velocidad_maxima || "",
      tanque: vehicle.tanque || "",
      maletero: vehicle.maletero || "",
      equipamiento: Array.isArray(vehicle.equipamiento)
        ? vehicle.equipamiento.join(", ")
        : "",
      seguridad: Array.isArray(vehicle.seguridad)
        ? vehicle.seguridad.join(", ")
        : "",
    });
    setEditingId(vehicle.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      images: [],
      imagePreviews: [],
      description: "",
      motor: "",
      potencia: "",
      torque: "",
      combustible: "",
      transmision: "",
      traccion: "",
      consumo_urbano: "",
      consumo_ruta: "",
      consumo_mixto: "",
      largo: "",
      ancho: "",
      alto: "",
      peso: "",
      cilindrada: "",
      aceleracion: "",
      velocidad_maxima: "",
      tanque: "",
      maletero: "",
      equipamiento: "",
      seguridad: "",
    });
    setEditingId(null);
    setShowModal(false);
    setError("");
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

  const getCoverImage = () => {
    if (formData.imagePreviews.length > 0) {
      return formData.imagePreviews[0].preview;
    }
    return null;
  };

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
          + Agregar Nuevo Vehículo
        </button>

        {/* MODAL FLOTANTE */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingId ? "Editar Vehículo" : "Nuevo Vehículo"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-2xl hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2">Marca</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Modelo</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Año</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Precio</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">
                      🖼️ Fotos del Auto (La primera será la portada)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Selecciona una o varias imágenes. La primera será mostrada
                      como portada.
                    </p>
                  </div>

                  {formData.imagePreviews.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block font-bold mb-2">
                        Vista previa de imágenes (
                        {formData.imagePreviews.length})
                      </label>
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
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Motor</label>
                    <input
                      type="text"
                      name="motor"
                      value={formData.motor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Potencia</label>
                    <input
                      type="text"
                      name="potencia"
                      value={formData.potencia}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Torque</label>
                    <input
                      type="text"
                      name="torque"
                      value={formData.torque}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Combustible</label>
                    <input
                      type="text"
                      name="combustible"
                      value={formData.combustible}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Transmisión</label>
                    <input
                      type="text"
                      name="transmision"
                      value={formData.transmision}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Tracción</label>
                    <input
                      type="text"
                      name="traccion"
                      value={formData.traccion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">
                      Equipamiento (separado por comas)
                    </label>
                    <textarea
                      name="equipamiento"
                      value={formData.equipamiento}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Aire acondicionado, Dirección hidráulica, Elevalunas eléctricos"
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">
                      Seguridad (separado por comas)
                    </label>
                    <textarea
                      name="seguridad"
                      value={formData.seguridad}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="ABS, Airbags, Control de estabilidad"
                    ></textarea>
                  </div>
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
                    {uploadingImages
                      ? "Subiendo imágenes..."
                      : editingId
                      ? "Actualizar"
                      : "Crear"}{" "}
                    Vehículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-bold mb-4">🔍 Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block font-bold mb-2">Buscar</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Marca o modelo..."
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Marca</label>
              <select
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Todas</option>
                {[...new Set(vehicles.map((v) => v.brand))].map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Año</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Todos</option>
                {[...new Set(vehicles.map((v) => v.year))]
                  .sort()
                  .reverse()
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Precio Mínimo</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Precio Máximo</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="999999"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={resetFilters}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            >
              Limpiar Filtros
            </button>
            <span className="text-gray-700 font-bold py-2 px-4">
              {filteredVehicles.length} vehículo(s) encontrado(s)
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Vehículos Registrados</h2>
        {loading ? (
          <p className="text-gray-600">Cargando...</p>
        ) : filteredVehicles.length === 0 ? (
          <p className="text-gray-600">
            {vehicles.length === 0
              ? "No hay vehículos registrados aún."
              : "No hay vehículos que coincidan con los filtros."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVehicles.map((vehicle) => {
              const coverImage = vehicle.images
                ? vehicle.images.find((img) => img.is_cover)?.image_path ||
                  vehicle.images[0]?.image_path
                : null;
              return (
                <div
                  key={vehicle.id}
                  className="bg-white p-4 rounded-lg shadow-lg"
                >
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={vehicle.model}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-gray-600 mb-2">Año: {vehicle.year}</p>
                  <p className="text-lg font-bold text-blue-600 mb-2">
                    ${parseFloat(vehicle.price).toLocaleString("es-AR")}
                  </p>
                  {vehicle.images && (
                    <p className="text-sm text-gray-500 mb-2">
                      📸 {vehicle.images.filter((img) => img).length} fotos
                    </p>
                  )}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {vehicle.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded flex-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded flex-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
