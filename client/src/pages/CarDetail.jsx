import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_ENDPOINTS from "../config";

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedCars, setRelatedCars] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.VEHICLE_DETAIL(id));
        if (!response.ok) {
          throw new Error("Auto no encontrado");
        }
        const data = await response.json();
        setCar(data);
        setError(null);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error("Error:", err);
        setError("No pudimos cargar los detalles del auto");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedCars = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.VEHICLES);
        if (response.ok) {
          const data = await response.json();
          // Filter out current car and sort specifically or shuffle
          const otherCars = data.filter((c) => c.id !== parseInt(id));
          // Get 3 random cars
          const shuffled = otherCars.sort(() => 0.5 - Math.random());
          setRelatedCars(shuffled.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading related cars:", err);
      }
    };

    fetchCar();
    fetchRelatedCars();
  }, [id]);

  const getImages = () => {
    if (car?.images && Array.isArray(car.images)) {
      return car.images
        .filter((img) => img && img.image_path)
        .sort((a, b) => a.position - b.position);
    }
    return car?.image_url ? [{ image_path: car.image_url }] : [];
  };

  const images = getImages();
  const currentImage = images[currentImageIndex]?.image_path;

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando detalles del auto...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Error al cargar
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => navigate("/catalogo")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = (price) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    }).format(price);

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/catalogo")}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            ← Volver al Catálogo
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            {car.brand} {car.model}
          </h1>
          <p className="text-xl text-gray-600 mt-2">Año {car.year}</p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Carrusel de Imágenes */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg mb-6 relative group">
              <img
                src={currentImage}
                alt={`${car.brand} ${car.model} - Foto ${
                  currentImageIndex + 1
                }`}
                className="w-full h-96 object-cover"
              />

              {/* Controles del Carrusel */}
              {images.length > 1 && (
                <>
                  {/* Botón Anterior */}
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition z-10"
                    aria-label="Imagen anterior"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Botón Siguiente */}
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition z-10"
                    aria-label="Siguiente imagen"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Indicador de posición */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas del Carrusel */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex
                        ? "border-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image.image_path}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Descripción */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {car.description}
              </p>
            </div>
          </div>

          {/* Panel Precio y CTA */}
          <div>
            <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg sticky top-20">
              <p className="text-sm text-blue-100 mb-2">Precio Final</p>
              <p className="text-4xl font-bold mb-6">
                {formattedPrice(car.price)}
              </p>

              <div className="space-y-3 mb-6">
                <p className="text-blue-100 text-sm">
                  ✓ Financiamiento disponible
                </p>
                <p className="text-blue-100 text-sm">✓ Garantía incluida</p>
                <p className="text-blue-100 text-sm">✓ Entrega inmediata</p>
              </div>

              <a
                href="https://api.whatsapp.com/send/?phone=543465668393&text=Holaa+Quiero+hacer+una+consulta&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-white text-blue-600 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition mb-3"
              >
                Solicitar Prueba
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=543465668393&text=Holaa+Quiero+hacer+una+consulta&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition"
              >
                Contactar Vendedor
              </a>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-8 rounded-xl mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ficha Técnica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Motor */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                MOTOR
              </h3>
              <p className="text-lg font-bold text-gray-900">{car.motor}</p>
            </div>

            {/* Potencia */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                POTENCIA
              </h3>
              <p className="text-lg font-bold text-gray-900">{car.potencia}</p>
            </div>

            {/* Torque */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                TORQUE
              </h3>
              <p className="text-lg font-bold text-gray-900">{car.torque}</p>
            </div>

            {/* Cilindrada */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                CILINDRADA
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {car.cilindrada}
              </p>
            </div>

            {/* Combustible */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                COMBUSTIBLE
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {car.combustible}
              </p>
            </div>

            {/* Transmisión */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                TRANSMISIÓN
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {car.transmision}
              </p>
            </div>

            {/* Tracción */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                TRACCIÓN
              </h3>
              <p className="text-lg font-bold text-gray-900">{car.traccion}</p>
            </div>

            {/* Velocidad Máxima */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                VELOCIDAD MÁXIMA
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {car.velocidad_maxima}
              </p>
            </div>
          </div>
        </div>

        {/* Consumo de Combustible */}
        <div className="bg-white border border-gray-200 p-8 rounded-xl mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Consumo de Combustible
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-gray-600 mb-1">Consumo Urbano</p>
              <p className="text-3xl font-bold text-gray-900">
                {car.consumo_urbano}
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-gray-600 mb-1">Consumo en Ruta</p>
              <p className="text-3xl font-bold text-gray-900">
                {car.consumo_ruta}
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-gray-600 mb-1">Consumo Mixto</p>
              <p className="text-3xl font-bold text-gray-900">
                {car.consumo_mixto}
              </p>
            </div>
          </div>
        </div>

        {/* Dimensiones */}
        <div className="bg-gray-50 p-8 rounded-xl mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Dimensiones</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Largo</p>
              <p className="text-2xl font-bold text-gray-900">{car.largo}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Ancho</p>
              <p className="text-2xl font-bold text-gray-900">{car.ancho}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Alto</p>
              <p className="text-2xl font-bold text-gray-900">{car.alto}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Peso</p>
              <p className="text-2xl font-bold text-gray-900">{car.peso}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Maletero</p>
              <p className="text-2xl font-bold text-gray-900">{car.maletero}</p>
            </div>
          </div>
        </div>

        {/* Capacidades */}
        <div className="bg-white border border-gray-200 p-8 rounded-xl mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Capacidades</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-gray-600 mb-1">Pasajeros</p>
              <p className="text-3xl font-bold text-gray-900">
                {car.pasajeros}
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-gray-600 mb-1">Capacidad Tanque</p>
              <p className="text-3xl font-bold text-gray-900">{car.tanque}</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-sm text-gray-600 mb-1">Aceleración 0-100</p>
              <p className="text-3xl font-bold text-gray-900">
                {car.aceleracion}
              </p>
            </div>
          </div>
        </div>

        {/* Equipamiento */}
        {car.equipamiento && car.equipamiento.length > 0 && (
          <div className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Equipamiento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {car.equipamiento.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="text-blue-600 text-2xl mr-4">✓</div>
                  <p className="text-gray-700 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seguridad */}
        {car.seguridad && car.seguridad.length > 0 && (
          <div className="bg-white border border-gray-200 p-8 rounded-xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Características de Seguridad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {car.seguridad.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-50 p-4 rounded-lg"
                >
                  <div className="text-green-600 text-2xl mr-4">🛡️</div>
                  <p className="text-gray-700 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Final */}
        <div className="bg-blue-600 text-white p-12 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-4">¿Te interesa este auto?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Contacta con nuestros asesores ahora y obtén una prueba de manejo
            gratuita
          </p>
          <a
            href="https://api.whatsapp.com/send/?phone=543465668393&text=Holaa+Quiero+hacer+una+consulta&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Solicitar Información
          </a>
        </div>

        {/* Autos Relacionados Carousel */}
        {relatedCars.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Autos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCars.map((related) => {
                const relatedCoverImage = related.images
                  ? related.images.find((img) => img.is_cover)?.image_path ||
                    related.images[0]?.image_path
                  : related.image_url;
                return (
                  <div
                    key={related.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={relatedCoverImage}
                        alt={`${related.brand} ${related.model}`}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {related.brand} {related.model}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {related.description}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Precio</p>
                          <p className="text-xl font-bold text-blue-600">
                            {formattedPrice(related.price)}
                          </p>
                        </div>
                        <Link
                          to={`/catalogo/${related.id}`}
                          onClick={() => window.scrollTo(0, 0)}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                        >
                          Ver Detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
