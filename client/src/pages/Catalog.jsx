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

  // Obtener vehículos (ahora publicaciones) del backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PUBLICATIONS);
        if (!response.ok) {
          throw new Error("Error al obtener las publicaciones");
        }
        const data = await response.json();
        
        // Mapear la estructura nueva a la vieja para compatibilidad
        // La API devuelve: { id, title, price, description, category, specs: { brand, model... } }
        // Flatten specs para que el código existente funcione (v.brand, v.model)
        const mappedData = data.map(item => ({
             ...item,
             ...item.specs, // Flatten specs
             // Asegurar título si brand/model no existen en specs (casos nuevos)
             brand: item.specs?.brand || (item.title ? item.title.split(' ')[0] : 'Varios'), 
             model: item.specs?.model || (item.title ? item.title.substring(item.title.indexOf(' ')+1) : ''),
        }));

        setVehicles(mappedData);
        // Calcular rango de precios máximo
        const maxPrice = mappedData.length > 0 ? Math.max(...mappedData.map((v) => Number(v.price))) : 100000;
        setPriceRange([0, maxPrice]);
        setFilteredVehicles(mappedData);
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
    return ["todos", ...new Set(filtered.map((v) => v.brand).filter(Boolean))].sort();
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
    return ["todos", ...new Set(filtered.map((v) => v.combustible).filter(Boolean))].sort();
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
    return ["todos", ...new Set(filtered.map((v) => v.transmision).filter(Boolean))].sort();
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
    return ["todos", ...new Set(filtered.map((v) => v.traccion).filter(Boolean))].sort();
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
      ? Math.max(...filtered.map((v) => Number(v.price)))
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
      const maxPrice = Math.max(...vehicles.map((v) => Number(v.price)));
      setPriceRange([0, maxPrice]);
    }
  };

  // Estados para modales móviles
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2 lg:mb-4">
            Catálogo
          </h1>
          <p className="text-lg lg:text-xl text-gray-600">
            Disponibles: <span className="font-bold">{vehicles.length}</span>{" "}
            publicaciones
          </p>
        </div>

        {/* Botones Móviles (Sticky) */}
        {!loading && vehicles.length > 0 && (
          <div className="lg:hidden sticky top-4 z-40 bg-white/95 backdrop-blur-sm shadow-md rounded-lg p-2 mb-6 flex gap-2 border border-emerald-100">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition border border-stone-200"
            >
              <span className="text-xl">🌪️</span> Filtrar
            </button>
            <button 
              onClick={() => setShowMobileSort(true)}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition border border-stone-200"
            >
              <span className="text-xl">⇅</span> Ordenar
            </button>
          </div>
        )}

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR FILTROS (Desktop) */}
          {!loading && vehicles.length > 0 && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-4 bg-white border border-stone-200 shadow-sm rounded-xl p-6 space-y-6">
                <FiltersContent 
                  brands={brands} selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                  maxPrice={maxPrice} priceRange={priceRange} setPriceRange={setPriceRange}
                  fuels={fuels} selectedFuel={selectedFuel} setSelectedFuel={setSelectedFuel}
                  transmissions={transmissions} selectedTransmission={selectedTransmission} setSelectedTransmission={setSelectedTransmission}
                  tractions={tractions} selectedTraction={selectedTraction} setSelectedTraction={setSelectedTraction}
                  sortBy={sortBy} setSortBy={setSortBy}
                  clearFilters={clearFilters}
                  filteredCount={filteredVehicles.length}
                  totalCount={vehicles.length}
                />
              </div>
            </div>
          )}

          {/* PRODUCTOS - Columna Derecha */}
          <div className="lg:col-span-3">
            {loading ? (
              // Loading State
              <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                  <p className="text-stone-600 text-lg">Cargando catálogo...</p>
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
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  Sin resultados
                </h2>
                <p className="text-stone-600 mb-6">
                  No encontramos items que coincidan con tus filtros.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  Ver Todo
                </button>
              </div>
            ) : (
              // Grid de Vehículos
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL MÓVIL: FILTROS */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 transition-opacity backdrop-blur-sm">
          <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-slide-up">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-lg font-bold text-stone-800">Filtros</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-stone-500 hover:text-stone-800 p-2">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
               <FiltersContent 
                  brands={brands} selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                  maxPrice={maxPrice} priceRange={priceRange} setPriceRange={setPriceRange}
                  fuels={fuels} selectedFuel={selectedFuel} setSelectedFuel={setSelectedFuel}
                  transmissions={transmissions} selectedTransmission={selectedTransmission} setSelectedTransmission={setSelectedTransmission}
                  tractions={tractions} selectedTraction={selectedTraction} setSelectedTraction={setSelectedTraction}
                  // Sort no se muestra aquí en móvil
                  sortBy={null} setSortBy={null}
                  clearFilters={clearFilters}
                  filteredCount={filteredVehicles.length}
                  totalCount={vehicles.length}
                  isMobile={true}
                />
            </div>
            <div className="p-4 border-t border-stone-100 bg-stone-50">
               <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
               >
                 Ver {filteredVehicles.length} resultados
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MÓVIL: ORDENAR */}
      {showMobileSort && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Ordenar por</h2>
              <button onClick={() => setShowMobileSort(false)} className="text-gray-500 hover:text-gray-800 p-2">✕</button>
            </div>
            <div className="p-4 space-y-2">
              {[
                { val: 'name', label: 'Nombre (A-Z)' },
                { val: 'precio-asc', label: 'Precio: Menor a Mayor' },
                { val: 'precio-desc', label: 'Precio: Mayor a Menor' },
                { val: 'año', label: 'Año: Más Nuevo' }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => { setSortBy(opt.val); setShowMobileSort(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center ${sortBy === opt.val ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  {opt.label}
                  {sortBy === opt.val && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente reutilizable para el contenido de los filtros
const FiltersContent = ({ 
  brands, selectedBrand, setSelectedBrand,
  maxPrice, priceRange, setPriceRange,
  fuels, selectedFuel, setSelectedFuel,
  transmissions, selectedTransmission, setSelectedTransmission,
  tractions, selectedTraction, setSelectedTraction,
  sortBy, setSortBy,
  clearFilters,
  filteredCount, totalCount,
  isMobile = false
}) => (
  <>
    {!isMobile && (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Filtros
        </h2>
      </div>
    )}

    {/* Filtro por Marca */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Marca
      </label>
      <select
        value={selectedBrand}
        onChange={(e) => setSelectedBrand(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
          className="w-full accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-stone-600">
          <span>${priceRange[0].toLocaleString()}</span>
          <span>${priceRange[1].toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Filtros dinámicos */}
    {fuels.length > 0 && (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Combustible
      </label>
      <select
        value={selectedFuel}
        onChange={(e) => setSelectedFuel(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      >
        {fuels.map((fuel) => (
          <option key={fuel} value={fuel}>
            {fuel === "todos" ? "Todos los tipos" : fuel}
          </option>
        ))}
      </select>
    </div>
    )}

    {transmissions.length > 0 && (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Transmisión
      </label>
      <select
        value={selectedTransmission}
        onChange={(e) => setSelectedTransmission(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      >
        {transmissions.map((trans) => (
          <option key={trans} value={trans}>
            {trans === "todos" ? "Todas las transmisiones" : trans}
          </option>
        ))}
      </select>
    </div>
    )}

    {tractions.length > 0 && (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Tracción
      </label>
      <select
        value={selectedTraction}
        onChange={(e) => setSelectedTraction(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
    )}

    {/* Ordenamiento (Solo Desktop) */}
    {sortBy && (
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Ordenar por
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="name">Nombre (A-Z)</option>
          <option value="precio-asc">Precio ($ ↑)</option>
          <option value="precio-desc">Precio ($ ↓)</option>
          <option value="año">Año (Más Nuevo)</option>
        </select>
      </div>
    )}

    {/* Botón Limpiar */}
    <button
      onClick={clearFilters}
      className="w-full bg-stone-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-stone-700 transition duration-300 text-sm"
    >
      Limpiar Filtros
    </button>

    {/* Contador */}
    <div className="border-t border-gray-200 pt-4 text-xs text-gray-600">
      <p>
        Mostrando <span className="font-bold text-gray-900">{filteredCount}</span> de{" "}
        <span className="font-bold text-gray-900">{totalCount}</span> items
      </p>
    </div>
  </>
);
