import { useState, useEffect } from "react";
import VehicleCard from "../components/VehicleCard";
import API_ENDPOINTS from "../config";

export default function Catalog() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  // Filtros
  const [selectedBrand, setSelectedBrand] = useState("todos");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedFuel, setSelectedFuel] = useState("todos");
  const [selectedTransmission, setSelectedTransmission] = useState("todos");
  const [selectedTraction, setSelectedTraction] = useState("todos");
  const [sortBy, setSortBy] = useState("name");

  // Obtener vehículos del backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.VEHICLES);
        if (!response.ok) {
          throw new Error("Error al obtener los vehículos");
        }
        const data = await response.json();
        setVehicles(data);
        // Calcular rango de precios máximo
        const maxPrice = Math.max(...data.map((v) => v.price));
        setPriceRange([0, maxPrice]);
        setFilteredVehicles(data);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError(
          "No pudimos cargar el catálogo. Por favor, intenta más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Calcular opciones disponibles dinámicamente
  const getAvailableBrands = () => {
    let filtered = vehicles;
    if (selectedFuel !== "todos")
      filtered = filtered.filter((v) => v.combustible === selectedFuel);
    if (selectedTransmission !== "todos")
      filtered = filtered.filter((v) => v.transmision === selectedTransmission);
    if (selectedTraction !== "todos")
      filtered = filtered.filter((v) => v.traccion === selectedTraction);
    filtered = filtered.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1]
    );
    return ["todos", ...new Set(filtered.map((v) => v.brand))].sort();
  };

  const getAvailableFuels = () => {
    let filtered = vehicles;
    if (selectedBrand !== "todos")
      filtered = filtered.filter((v) => v.brand === selectedBrand);
    if (selectedTransmission !== "todos")
      filtered = filtered.filter((v) => v.transmision === selectedTransmission);
    if (selectedTraction !== "todos")
      filtered = filtered.filter((v) => v.traccion === selectedTraction);
    filtered = filtered.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1]
    );
    return ["todos", ...new Set(filtered.map((v) => v.combustible))].sort();
  };

  const getAvailableTransmissions = () => {
    let filtered = vehicles;
    if (selectedBrand !== "todos")
      filtered = filtered.filter((v) => v.brand === selectedBrand);
    if (selectedFuel !== "todos")
      filtered = filtered.filter((v) => v.combustible === selectedFuel);
    if (selectedTraction !== "todos")
      filtered = filtered.filter((v) => v.traccion === selectedTraction);
    filtered = filtered.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1]
    );
    return ["todos", ...new Set(filtered.map((v) => v.transmision))].sort();
  };

  const getAvailableTractions = () => {
    let filtered = vehicles;
    if (selectedBrand !== "todos")
      filtered = filtered.filter((v) => v.brand === selectedBrand);
    if (selectedFuel !== "todos")
      filtered = filtered.filter((v) => v.combustible === selectedFuel);
    if (selectedTransmission !== "todos")
      filtered = filtered.filter((v) => v.transmision === selectedTransmission);
    filtered = filtered.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1]
    );
    return ["todos", ...new Set(filtered.map((v) => v.traccion))].sort();
  };

  const getMaxPrice = () => {
    let filtered = vehicles;
    if (selectedBrand !== "todos")
      filtered = filtered.filter((v) => v.brand === selectedBrand);
    if (selectedFuel !== "todos")
      filtered = filtered.filter((v) => v.combustible === selectedFuel);
    if (selectedTransmission !== "todos")
      filtered = filtered.filter((v) => v.transmision === selectedTransmission);
    if (selectedTraction !== "todos")
      filtered = filtered.filter((v) => v.traccion === selectedTraction);
    return filtered.length > 0
      ? Math.max(...filtered.map((v) => v.price))
      : 100000;
  };

  const brands = getAvailableBrands();
  const fuels = getAvailableFuels();
  const transmissions = getAvailableTransmissions();
  const tractions = getAvailableTractions();
  const maxPrice = getMaxPrice();

  // Filtrar y ordenar vehículos
  useEffect(() => {
    let filtered = vehicles;

    // Filtrar por marca
    if (selectedBrand !== "todos") {
      filtered = filtered.filter((v) => v.brand === selectedBrand);
    }

    // Filtrar por rango de precio
    filtered = filtered.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1]
    );

    // Filtrar por combustible
    if (selectedFuel !== "todos") {
      filtered = filtered.filter((v) => v.combustible === selectedFuel);
    }

    // Filtrar por transmisión
    if (selectedTransmission !== "todos") {
      filtered = filtered.filter((v) => v.transmision === selectedTransmission);
    }

    // Filtrar por tracción
    if (selectedTraction !== "todos") {
      filtered = filtered.filter((v) => v.traccion === selectedTraction);
    }

    // Ordenar
    if (sortBy === "precio-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "precio-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "año") {
      filtered.sort((a, b) => b.year - a.year);
    } else {
      // nombre (alfabético)
      filtered.sort((a, b) =>
        `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      );
    }

    setFilteredVehicles(filtered);
  }, [
    vehicles,
    selectedBrand,
    priceRange,
    selectedFuel,
    selectedTransmission,
    selectedTraction,
    sortBy,
  ]);

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedBrand("todos");
    setSelectedFuel("todos");
    setSelectedTransmission("todos");
    setSelectedTraction("todos");
    setSortBy("name");
    if (vehicles.length > 0) {
      const maxPrice = Math.max(...vehicles.map((v) => v.price));
      setPriceRange([0, maxPrice]);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Catálogo de Vehículos
          </h1>
          <p className="text-xl text-gray-600">
            Disponibles: <span className="font-bold">{vehicles.length}</span>{" "}
            vehículos
          </p>
        </div>

        {/* Layout de dos columnas: Filtros + Productos */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FILTROS - Columna Izquierda */}
          {!loading && vehicles.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-gray-50 rounded-xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Filtros
                  </h2>
                </div>

                {/* Filtro por Marca */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Marca
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand === "todos" ? "Todas las marcas" : brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Precio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Precio
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Filtro por Combustible */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Combustible
                  </label>
                  <select
                    value={selectedFuel}
                    onChange={(e) => setSelectedFuel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    {fuels.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel === "todos" ? "Todos los tipos" : fuel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Transmisión */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Transmisión
                  </label>
                  <select
                    value={selectedTransmission}
                    onChange={(e) => setSelectedTransmission(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    {transmissions.map((trans) => (
                      <option key={trans} value={trans}>
                        {trans === "todos" ? "Todas las transmisiones" : trans}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Tracción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Tracción
                  </label>
                  <select
                    value={selectedTraction}
                    onChange={(e) => setSelectedTraction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    {tractions.map((traction) => (
                      <option key={traction} value={traction}>
                        {traction === "todos"
                          ? "Todas las tracciones"
                          : traction}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ordenamiento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="name">Nombre (A-Z)</option>
                    <option value="precio-asc">Precio ($ ↑)</option>
                    <option value="precio-desc">Precio ($ ↓)</option>
                    <option value="año">Año (Más Nuevo)</option>
                  </select>
                </div>

                {/* Botón Limpiar */}
                <button
                  onClick={clearFilters}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 text-sm"
                >
                  Limpiar Filtros
                </button>

                {/* Contador */}
                <div className="border-t border-gray-200 pt-4 text-xs text-gray-600">
                  <p>
                    Mostrando{" "}
                    <span className="font-bold text-gray-900">
                      {filteredVehicles.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-bold text-gray-900">
                      {vehicles.length}
                    </span>{" "}
                    autos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTOS - Columna Derecha */}
          <div className="lg:col-span-3">
            {loading ? (
              // Loading State
              <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 text-lg">Cargando catálogo...</p>
                </div>
              </div>
            ) : error ? (
              // Error State
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">
                  Error al cargar
                </h2>
                <p className="text-red-700 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredVehicles.length === 0 ? (
              // Empty State
              <div className="bg-gray-50 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sin resultados
                </h2>
                <p className="text-gray-600 mb-6">
                  No encontramos autos que coincidan con tus filtros.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Ver Todos los Autos
                </button>
              </div>
            ) : (
              // Grid de Vehículos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
